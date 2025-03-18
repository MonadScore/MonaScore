// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MonaScoreV1_1.sol";

contract MonaScoreTest is Test {
    MonaScoreV1_1 public monaScore;

    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");

    function setUp() public {
        monaScore = new MonaScoreV1_1();

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
            bytes32[] memory messageHashes,
            uint256[] memory timestamps,
            uint256 lastClaim,
            bool registered
        ) = monaScore.getUser(user1);

        // Check basic registration info.
        assertEq(addr, user1, "User address must be user1");
        assertEq(points, 0, "Points must be zero after registration");
        assertTrue(registered, "User must be registered");
        assertTrue(bytes(referral).length > 0, "Referral code must be non-empty");
        assertEq(messageHashes.length, 0, "Message history must be empty");
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
        (,, string memory referral1,,,,) = monaScore.getUser(user1);

        // User2 registers using user1's referral code.
        vm.prank(user2, user2);
        monaScore.register(referral1);

        // Check that user1 got a referral bonus.
        (, uint256 points1,,,,,) = monaScore.getUser(user1);
        assertEq(points1, 1, "User1 should receive 1 point for a referral");

        // User2 should start with 0 points.
        (, uint256 points2,,,,,) = monaScore.getUser(user2);
        assertEq(points2, 0, "User2 should start with 0 points");
    }

    // Test the sendMessage functionality that now saves the keccak256 hash.
    function testSendMessage() public {
        vm.prank(user1, user1);
        monaScore.register("");

        string memory message = "Hello, world!";
        vm.prank(user1);
        monaScore.sendMessage(message);

        (, uint256 points,, bytes32[] memory messageHashes,,,) = monaScore.getUser(user1);

        // Ensure the user gains 1 point per message.
        assertEq(points, 1, "Sending a message should increase points by 1");

        // Ensure the message history contains exactly one hash.
        assertEq(messageHashes.length, 1, "Message history should contain one element");

        // Verify the stored hash matches the computed keccak256 hash.
        bytes32 expectedHash = keccak256(abi.encodePacked(message));
        assertEq(messageHashes[0], expectedHash, "Stored message hash must match expected hash");
    }

    // Test the claimPoints functionality (daily claim with a 24-hour cooldown).
    function testClaimPoints() public {
        vm.prank(user1, user1);
        monaScore.register("");

        // First daily claim should succeed.
        vm.prank(user1);
        monaScore.claimPoints();
        (, uint256 points,,,, uint256 lastClaim,) = monaScore.getUser(user1);
        assertEq(points, 1, "Claiming points should add 1 point");

        // A subsequent immediate claim should revert.
        vm.prank(user1);
        vm.expectRevert(MonaScoreV1_1.DailyClaimAlreadyTaken.selector);
        monaScore.claimPoints();

        // Simulate passage of more than 1 day.
        vm.warp(lastClaim + 1 days + 1);

        vm.prank(user1);
        monaScore.claimPoints();
        (, uint256 newPoints,,,,,) = monaScore.getUser(user1);
        assertEq(newPoints, 2, "After a day, claiming points again should increment points to 2");
    }

    function testGetSortedUsers() public {
        // Register three users.
        vm.prank(user1, user1);
        monaScore.register("");
        vm.prank(user2, user2);
        monaScore.register("");
        vm.prank(user3, user3);
        monaScore.register("");

        // Simulate activity:
        // user1 sends one message (points becomes 1).
        vm.prank(user1);
        monaScore.sendMessage("Message from user1");

        // user2 sends two messages (points becomes 2).
        vm.prank(user2);
        monaScore.sendMessage("Message from user2 - 1");
        vm.prank(user2);
        monaScore.sendMessage("Message from user2 - 2");

        // user3 sends three messages (points becomes 3).
        vm.prank(user3);
        monaScore.sendMessage("Message from user3 - 1");
        vm.prank(user3);
        monaScore.sendMessage("Message from user3 - 2");
        vm.prank(user3);
        monaScore.sendMessage("Message from user3 - 3");

        // Get all sorted users. There are 3 registered users.
        address[] memory sortedUsers = monaScore.getSortedUsers(3);

        // Expected sorted order (highest points first):
        // user3 (3 points), user2 (2 points), user1 (1 point).
        assertEq(sortedUsers[0], user3, "User3 should be first with highest points");
        assertEq(sortedUsers[1], user2, "User2 should be second");
        assertEq(sortedUsers[2], user1, "User1 should be third");
    }

    function testGetSortedUsersWithLimit() public {
        // Register two users.
        vm.prank(user1, user1);
        monaScore.register("");
        vm.prank(user2, user2);
        monaScore.register("");

        // user1 sends two messages (points = 2).
        vm.prank(user1);
        monaScore.sendMessage("u1 msg 1");
        vm.prank(user1);
        monaScore.sendMessage("u1 msg 2");

        // user2 sends one message (points = 1).
        vm.prank(user2);
        monaScore.sendMessage("u2 msg 1");

        // Call getSortedUsers asking for 5 users while only 2 are registered.
        address[] memory sortedUsers = monaScore.getSortedUsers(5);
        // The returned array length should be 2.
        assertEq(sortedUsers.length, 2, "Returned array length should match number of registered users");
        // Expected sorted order: user1 (2 points) then user2 (1 point).
        assertEq(sortedUsers[0], user1, "User1 should be first (2 points)");
        assertEq(sortedUsers[1], user2, "User2 should be second (1 point)");
    }
}
