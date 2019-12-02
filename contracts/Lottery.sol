pragma solidity >=0.4.24 <0.6.0;

contract Lottery {
  address public manager;
  address public winner;
  address payable[] public players;
  mapping(address => bool) public verifications;
  event UserVerified(address player, string jwt);
  event UserEntered(address sender);
  

  constructor() public {
    manager = msg.sender;
  }

  function enter() public payable isVerified  {
    require(msg.value > .01 ether, "Minimum bet is .01 Ether");
    emit UserEntered(msg.sender);
    players.push(msg.sender);
  }

  function verifyUser(string memory jwt, uint age, address player) public payable returns(bool){
    require(age >= uint(18), "you must be 18 years old to enter");
    verifications[player] = true;
    emit UserVerified(player, jwt);
    return verifications[player];
  }

  function pickWinner() public restricted {
    uint index = random() % players.length;
    players[index].transfer(address(this).balance);
    winner = players[index];
    players = new address payable[](0);
  }

  function listPlayers() public view returns (address payable[] memory ){
    return players;
  }

  function random() private view returns (uint){
    return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
  }

  modifier restricted() {
    require(msg.sender == manager, "only the manager can access this function");
    _;
  }

  modifier isVerified() {
    require((verifications[msg.sender] == true), "You must verify your age");
    _;
  }
}