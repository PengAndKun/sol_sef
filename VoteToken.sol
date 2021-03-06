// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <=0.8.0;
import "../../ERC20/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../ERC20/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

/*
contract StandardToken  is ERC20{
	//??????SafeMath
    using SafeMath for uint256;
   
    //????????????
    string public name;
    //????????????
    string public symbol;
	//??????????????????(?????????????????????????????????)
    uint8 public  decimals;
	//????????????
	uint256 public totalSupply;
   
	//??????????????????(???????????????????????????????????????????????????)???_value????????????????????????_to??????
    function transfer(address _to, uint256 _value) public returns (bool success);
    //???????????????????????????(????????????)???
    function votefromSel(uint256 _value)public returns(bool success);
    //?????????????????????????????????????????????)
    function votefromothers(address others,uint256 _value) public returns(bool success);
    //????????????
    function votingEnds()public returns(bool success);
	//?????????????????????
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
	//??????????????????????????????
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}
*/
contract VoteToken  is ERC20{
    struct Voter{
        address addr;
        uint256 amount;
    }
    struct Candidate {
    uint id;
    string name;  // ??????????????????
    uint voteCount;
}
    //????????????
    string public Tname;
    //????????????
    string public Tsymbol;
  //???????????????
    uint public votercount;
    //????????????????????????
    uint public candidatesCount;
    //??????????????????
    event voted(address indexed _voter,  uint indexed _candidateId,uint256 _amount );
    //???????????????
   // mapping(address =>uint256 )public voters;
   //mapping (address => uint256) public _balances;
   mapping(uint256 => Voter) public voting;
   mapping(uint => Candidate) public candidates;
    constructor() ERC20("VoteToken", "VTK")public{
        //totalSupply = 10000;
        //_name = "voteToken";
        //_symbol = "VTK";
      //  decimals = 0;
      //_totalSupply = 10000;
        votercount = 0;
        candidatesCount = 0;
        addCandidate("XD1");
        addCandidate("XE2");
        addCandidate("XS3");
        //_balances[msg.sender]=10000;
        _mint(msg.sender, 5000);

    }
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);

    }
    function addvoter(address addr,uint256 amount)private{
        for  (uint i =0;i < votercount;i++){
            if (voting[i].addr==addr){
                voting[i].amount += amount ;
                return ;
            }
        }
        voting[votercount] = Voter(addr,amount);
        votercount++;
    }

    function votefromSel(uint256 amount,uint _candidateId)public  returns(bool success){
        
        require(balanceOf(msg.sender)>=amount );
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        subT(msg.sender, amount); 

        addvoter(msg.sender, amount);
        candidates[_candidateId].voteCount +=amount;

        emit voted(msg.sender, _candidateId,amount);

        return true;
    }

    function votefromother(address sender,uint _candidateId,uint256 amount)public virtual returns(bool success){
        require(balanceOf(msg.sender) >=amount );
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        subT(sender, amount); 
       addvoter(sender, amount);
       candidates[_candidateId].voteCount +=amount;

        emit voted(sender, _candidateId,amount);

        return true;
    }
    function votingEnds()public returns(bool success){
        for  (uint i =0;i < votercount;i++){
            addT(voting[i].addr , voting[i].amount);
            delete voting[i];
        }
        for(uint j=0;j< candidatesCount;j++){
            candidates[j].voteCount =0;
        }

        return true;
    }
}