// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MonaScoreV1} from "../src/MonaScoreV1.sol";
import {MonaScoreV2} from "../src/MonaScoreV2.sol";

contract UpgradeUUPSProxy is Script {
    function run() external {
        vm.startBroadcast();

        // Get the proxy address from the environment
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        // Deploy new implementation
        MonaScoreV2 monaScoreV2 = new MonaScoreV2();
        console2.log("BoxV2 deployed at:", address(monaScoreV2));

        // Upgrade the proxy to use MonaScoreV2
        MonaScoreV1(proxyAddress).upgradeToAndCall(address(monaScoreV2), bytes(""));

        console2.log("Proxy upgraded to MonaScoreV2 at:", address(monaScoreV2));

        vm.stopBroadcast();
    }
}
