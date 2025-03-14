// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MonaScoreV1} from "../src/MonaScoreV1.sol";

contract DeployProxy is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy implementation contract (MonaScoreV1)
        MonaScoreV1 monaScoreV1 = new MonaScoreV1();
        console2.log("MonaScoreV1 deployed at:", address(monaScoreV1));

        // Encode the initialize function call
        bytes memory initializer = abi.encodeWithSelector(MonaScoreV1.initialize.selector);

        // Deploy UUPS Proxy pointing to MonaScoreV1
        ERC1967Proxy proxy = new ERC1967Proxy(address(monaScoreV1), initializer);
        console2.log("UUPS Proxy deployed at:", address(proxy));

        vm.stopBroadcast();
    }
}
