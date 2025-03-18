// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/utils/Strings.sol";

contract MonaScoreV1_1 {
    using Strings for uint256;

    uint256 constant PRIZE_POINTS = 36;

    struct User {
        address userAddress; // address of the user
        uint256 points; // number of points
        string referralCode; // referral code
        mapping(uint256 => Message) messages;
        uint256 messageCount; // Count of messages stored in the mapping.
        uint256 lastClaim; // timestamp of the last daily claim
        bool registered; // registration status
    }

    struct Message {
        bytes32 messageHash; // Hash of the sent message
        uint256 timestamp; // Timestamp when the message was sent
    }

    // Mapping from user address to user data.
    mapping(address => User) public users;
    // Mapping for checking if a referral code has been used (code to user address).
    mapping(string referralCode => address userAddress) public referralToAddress;

    event Registered(address indexed user, string referralCode);
    event MessageSent(address indexed user, bytes32 messageHash, uint256 timestamp);
    event PointsClaimed(address indexed user, uint256 points);
    event RouletteSpin(address indexed user, uint256 chosenNumber, uint256 result, bool won);
    event PointsUpdated(address indexed user, uint256 newScore);

    error UserAlreadyRegistered();
    error InvalidReferralCode();
    error ContractAreNotAllowed();
    error UserNotRegistered();
    error DailyClaimAlreadyTaken();

    modifier registeredUser() {
        require(users[msg.sender].registered, UserNotRegistered());
        _;
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin, ContractAreNotAllowed());
        _;
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
    function register(string memory _referralCode) external onlyEOA {
        require(!users[msg.sender].registered, UserAlreadyRegistered());

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

        // Initialize the user in storage.
        User storage user = users[msg.sender];
        user.userAddress = msg.sender;
        user.points = 0;
        user.referralCode = newReferralCode;
        user.messageCount = 0;
        // Set lastClaim to allow immediate claim after registration.
        user.lastClaim = block.timestamp - 1 days;
        user.registered = true;

        referralToAddress[newReferralCode] = msg.sender;

        emit Registered(msg.sender, newReferralCode);
    }

    /// @notice Send a message
    /// @param _message Message to be sent.
    function sendMessage(string memory _message) external registeredUser {
        bytes32 messageHash = keccak256(abi.encodePacked(_message));
        uint256 currentTime = block.timestamp;

        User storage user = users[msg.sender];
        user.messages[user.messageCount] = Message({messageHash: messageHash, timestamp: currentTime});
        user.messageCount++;

        user.points += 1;

        emit MessageSent(msg.sender, messageHash, currentTime);
        emit PointsUpdated(msg.sender, users[msg.sender].points);
    }

    /// Daily claim points.
    /// @notice Claim points once per day.
    function claimPoints() external registeredUser {
        require(block.timestamp >= users[msg.sender].lastClaim + 1 days, DailyClaimAlreadyTaken());

        User storage user = users[msg.sender];
        user.points += 1;
        user.lastClaim = block.timestamp;

        emit PointsClaimed(msg.sender, 1);
        emit PointsUpdated(msg.sender, users[msg.sender].points);
    }

    function spinRoulette(uint256 chosenNumber) public onlyEOA registeredUser returns (uint256) {
        require(chosenNumber <= 36, "Invalid number, must be between 0 and 36");

        // Generate random number from 0 to 36
        uint256 rouletteNumber =
            uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 37; // % 37 gets 0–36 range

        bool won = (rouletteNumber == chosenNumber);

        if (won) {
            users[msg.sender].points += PRIZE_POINTS;

            emit PointsUpdated(msg.sender, users[msg.sender].points);
        }

        emit RouletteSpin(msg.sender, chosenNumber, rouletteNumber, won);

        return rouletteNumber;
    }

    /// @notice Get user data.
    /// @param _user The address of the user.
    /// @return userAddress, points, referralCode, message hashes array, timestamps array, lastClaim, registered.
    function getUser(address _user)
        external
        view
        returns (address, uint256, string memory, bytes32[] memory, uint256[] memory, uint256, bool)
    {
        User storage user = users[_user];
        uint256 count = user.messageCount;
        bytes32[] memory messageHashes = new bytes32[](count);
        uint256[] memory timestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Message storage msgData = user.messages[i];
            messageHashes[i] = msgData.messageHash;
            timestamps[i] = msgData.timestamp;
        }

        return (
            user.userAddress, user.points, user.referralCode, messageHashes, timestamps, user.lastClaim, user.registered
        );
    }
}
