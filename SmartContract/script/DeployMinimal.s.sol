// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/script.sol";
import {MonaScoreV1_1} from "../src/MonaScoreV1_1.sol";

contract Deploy is Script {
    MonaScoreV1_1 public monaScore;

    function run() external {
        vm.startBroadcast();
        monaScore = new MonaScoreV1_1();
        vm.stopBroadcast();
    }
}
