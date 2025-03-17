// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Roulette.sol";

contract RouletteTest is Test {
    Roulette public roulette;

    address public user = makeAddr("user");

    function setUp() public {
        roulette = new Roulette();
    }

    function testRandomVulnerability() public {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, user))) % 37;

        vm.prank(user);
        uint256 rouletteNumber = roulette.spinRoulette(randomNumber);

        assertEq(randomNumber, rouletteNumber);
    }
}
