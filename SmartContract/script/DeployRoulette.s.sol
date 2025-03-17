// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/script.sol";
import {Roulette} from "../src/Roulette.sol";

contract DeployRoulette is Script {
    Roulette public roulette;

    function run() external {
        vm.startBroadcast();
        roulette = new Roulette();
        vm.stopBroadcast();
    }
}
