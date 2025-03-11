// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/script.sol";
import {MonaScore} from "../src/MonaScore.sol";

contract Deploy is Script {
    MonaScore public monaScore;

    function run() external {
        vm.startBroadcast();
        monaScore = new MonaScore();
        vm.stopBroadcast();
    }
}
