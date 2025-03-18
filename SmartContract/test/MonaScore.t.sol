// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MonaScore.sol";

contract MonaScoreTest is Test {
    MonaScore public monaScore;

    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");

    function setUp() public {
        monaScore = new MonaScore();

        // Set the starting block.timestamp to a non-zero value
        vm.warp(1 days);
    }

    function testRegister() public {
        vm.prank(user1, user1);
        monaScore.register("");

        (
            address addr,
            uint256 points,
            string memory referral,
            bytes32[] memory messageHistory,
            uint256 lastClaim,
            bool registered
        ) = monaScore.getUser(user1);

        // Check basic registration info.
        assertEq(addr, user1, "User address must be user1");
        assertEq(points, 0, "Points must be zero after registration");
        assertTrue(registered, "User must be registered");
        assertTrue(bytes(referral).length > 0, "Referral code must be non-empty");
        assertEq(messageHistory.length, 0, "Message history must be empty");
        assertEq(lastClaim, 0, "Last claim should be zero");

        // Verify the referral code mapping.
        address referrer = monaScore.referralToAddress(referral);
        assertEq(referrer, user1, "Referral code must map to user1");
    }

    // Test referral registration: user2 registers using user1's referral code.
    function testReferralRegistration() public {
        // User1 registers without referral.
        vm.prank(user1, user1);
        monaScore.register("");

        // Retrieve user1's referral code.
        (,, string memory referral1,,,) = monaScore.getUser(user1);

        // User2 registers using user1's referral code.
        vm.prank(user2, user2);
        monaScore.register(referral1);

        // Check that user1 got a referral bonus.
        (, uint256 points1,,,,) = monaScore.getUser(user1);
        assertEq(points1, 1, "User1 should receive 1 point for a referral");

        // User2 should start with 0 points.
        (, uint256 points2,,,,) = monaScore.getUser(user2);
        assertEq(points2, 0, "User2 should start with 0 points");
    }

    // Test the sendMessage functionality that now saves the keccak256 hash.
    function testSendMessage() public {
        vm.prank(user1, user1);
        monaScore.register("");

        string memory message = "Hello, world!";
        vm.prank(user1);
        monaScore.sendMessage(message);

        (, uint256 points,, bytes32[] memory messageHistory,,) = monaScore.getUser(user1);

        // Ensure the user gains 1 point per message.
        assertEq(points, 1, "Sending a message should increase points by 1");

        // Ensure the message history contains exactly one hash.
        assertEq(messageHistory.length, 1, "Message history should contain one element");

        // Verify the stored hash matches the computed keccak256 hash.
        bytes32 expectedHash = keccak256(abi.encodePacked(message));
        assertEq(messageHistory[0], expectedHash, "Stored message hash must match expected hash");
    }

    // Test the claimPoints functionality (daily claim with a 24-hour cooldown).
    function testClaimPoints() public {
        vm.prank(user1, user1);
        monaScore.register("");

        // First daily claim should succeed.
        vm.prank(user1);
        monaScore.claimPoints();
        (, uint256 points,,, uint256 lastClaim,) = monaScore.getUser(user1);
        assertEq(points, 1, "Claiming points should add 1 point");

        // A subsequent immediate claim should revert.
        vm.prank(user1);
        vm.expectRevert(MonaScore.DailyClaimAlreadyTaken.selector);
        monaScore.claimPoints();

        // Simulate passage of more than 1 day.
        vm.warp(lastClaim + 1 days + 1);

        vm.prank(user1);
        monaScore.claimPoints();
        (, uint256 newPoints,,,,) = monaScore.getUser(user1);
        assertEq(newPoints, 2, "After a day, claiming points again should increment points to 2");
    }
}
