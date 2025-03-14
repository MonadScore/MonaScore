// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MonaScoreV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    using Strings for uint256;

    struct User {
        address userAddress; // address of the user
        uint256 points; // number of points
        string referralCode; // referral code
        bytes32[] messageHistory; // history of message hashes
        uint256 lastClaim; // timestamp of the last daily claim
        bool registered; // registration status
    }

    // Mapping from user address to user data.
    mapping(address => User) public users;
    // Mapping for checking if a referral code has been used (code to user address).
    mapping(string referralCode => address userAddress) public referralToAddress;

    event Registered(address indexed user, string referralCode);
    event MessageSent(address indexed user, string message);
    event PointsClaimed(address indexed user, uint256 points);

    error UserAlreadyRegistered();
    error InvalidReferralCode();
    error ContractAreNotAllowed();
    error UserNotRegistered();
    error DailyClaimAlreadyTaken();

    modifier registeredUser() {
        require(users[msg.sender].registered, UserNotRegistered());
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    /// @notice Returns a generated referral code based on the user's address and a nonce.
    /// @param _user User's address.
    /// @param _nonce Number to ensure uniqueness.
    function generateReferralCode(address _user, uint256 _nonce) internal view returns (string memory) {
        bytes32 hashCode = keccak256(abi.encodePacked(_user, block.timestamp, _nonce));
        return Strings.toHexString(uint256(hashCode));
    }

    /// @notice Register a new user.
    /// @param _referralCode Referral code of the user who invited this user. (optional)
    function register(string memory _referralCode) external {
        require(!users[msg.sender].registered, UserAlreadyRegistered());
        //require(msg.sender == tx.origin, ContractAreNotAllowed());

        // Check if referral code is valid and give +1 point to referrer.
        if (bytes(_referralCode).length > 0) {
            address referrer = referralToAddress[_referralCode];
            require(referrer != address(0), InvalidReferralCode());
            users[referrer].points += 1;
        }

        // Generate a new referral code for the user.
        uint256 nonce = 0;
        string memory newReferralCode = generateReferralCode(msg.sender, nonce);

        // Check if the generated referral code is unique.
        while (referralToAddress[newReferralCode] != address(0)) {
            nonce++;
            newReferralCode = generateReferralCode(msg.sender, nonce);
        }

        // Create and store the new user record with the generated referral code.
        users[msg.sender] = User({
            userAddress: msg.sender,
            points: 0,
            referralCode: newReferralCode,
            messageHistory: new bytes32[](0),
            lastClaim: block.timestamp - 1 days, // Allow immediate claim after registration.
            registered: true
        });

        referralToAddress[newReferralCode] = msg.sender;

        emit Registered(msg.sender, newReferralCode);
    }

    /// @notice Send a message
    /// @param _message Message to be sent.
    function sendMessage(string memory _message) external registeredUser {
        bytes32 messageHash = keccak256(abi.encodePacked(_message));
        users[msg.sender].messageHistory.push(messageHash);

        users[msg.sender].points += 1;

        emit MessageSent(msg.sender, _message);
    }

    /// Daily claim points.
    /// @notice Claim points once per day.
    function claimPoints() external registeredUser {
        require(block.timestamp >= users[msg.sender].lastClaim + 1 days, DailyClaimAlreadyTaken());

        users[msg.sender].points += 1;
        users[msg.sender].lastClaim = block.timestamp;

        emit PointsClaimed(msg.sender, 1);
    }

    /// @notice Get user data.
    /// @param _user User's address.
    /// @return A tuple containing the user's address, points, referral code, message history (hashes), last claim time, and registration status.
    function getUser(address _user)
        external
        view
        returns (address, uint256, string memory, bytes32[] memory, uint256, bool)
    {
        User memory user = users[_user];
        return (user.userAddress, user.points, user.referralCode, user.messageHistory, user.lastClaim, user.registered);
    }

    // function version() public pure virtual returns (uint256) {
    //     return 1;
    // }

    // Function required for UUPS proxy
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
