// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Roulette {
    uint256 constant PRIZE_POINTS = 36;
    mapping(address => uint256) public playerPoints;
    address[] private players;
    mapping(address => bool) private isRegistered;

    event RouletteSpin(address indexed player, uint256 chosenNumber, uint256 result, bool won);
    event PointsUpdated(address indexed player, uint256 newScore);

    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Contracts not allowed");
        _;
    }

    function spinRoulette(uint256 chosenNumber) public onlyEOA returns (uint256) {
        require(chosenNumber <= 36, "Invalid number, must be between 0 and 36");

        // Генерируем случайное число от 0 до 36
        uint256 rouletteNumber =
            uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 37; // % 37 даёт диапазон 0–36

        bool won = (rouletteNumber == chosenNumber);

        // Если игрок угадал, начисляем 36 поинтов
        if (won) {
            playerPoints[msg.sender] += PRIZE_POINTS;

            // Добавляем игрока в список, если он еще не играл
            if (!isRegistered[msg.sender]) {
                isRegistered[msg.sender] = true;
                players.push(msg.sender);
            }

            emit PointsUpdated(msg.sender, playerPoints[msg.sender]);
        }

        // Эмитируем событие с результатами
        emit RouletteSpin(msg.sender, chosenNumber, rouletteNumber, won);

        return rouletteNumber;
    }

    // Функция для получения всех игроков с их поинтами (без сортировки)
    function getAllPlayers() public view returns (address[] memory, uint256[] memory) {
        uint256 len = players.length;
        address[] memory allPlayers = new address[](len);
        uint256[] memory scores = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            allPlayers[i] = players[i];
            scores[i] = playerPoints[players[i]];
        }

        return (allPlayers, scores);
    }
}
