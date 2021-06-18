// SPDX-License-Identifier: MIT
pragma solidity <=0.8.0;
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
	//使用SafeMath
    using SafeMath for uint256;
   
    //代币名称
    string public name;
    //代币缩写
    string public symbol;
	//代币小数位数(一个代币可以分为多少份)
    uint8 public  decimals;
	//代币总数
	uint256 public totalSupply;
   
	//交易的发起方(谁调用这个方法，谁就是交易的发起方)把_value数量的代币发送到_to账户
    function transfer(address _to, uint256 _value) public returns (bool success);
    //发起方自己参加投票(使用代币)　
    function votefromSel(uint256 _value)public returns(bool success);
    //发起方替别人发起投票（使用代币)
    function votefromothers(address others,uint256 _value) public returns(bool success);
    //结束投票
    function votingEnds()public returns(bool success);
	//转账成功的事件
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
	//使用权委托成功的事件
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}
*/
contract VoteT  is ERC20{
    struct  voteNumOfCandidate {
        uint256 CandidateId;
        uint256 votedNum;
    }
    struct Voter{
  //      uint256 Token;
        uint256 votedToken;
        uint256 eventNum;
        bool redeemVote ;
        mapping(uint256 => voteNumOfCandidate) votedEvent;
       
    }
    struct Candidate {
    string name;  // 候选人的名字
    uint voteCount;
}
    //代币名称
    string public Tname;
    //代币缩写
    string public Tsymbol;
  //投票的数量
    uint public votercount;
    //可以投票人的数量
    uint public candidatesCount;
//投票的总数量
    uint256 totalballot;
    //投票结束
    bool votingend;

    //候选人数组

    mapping(uint =>Candidate) public  Candidates;
    //投票完成事件
    event voted(address indexed _voter,  uint indexed _candidateId,uint256 _amount );
    //发送投票给其他想投票的人
    event ballotsend(address indexed _Address,uint256 _amount);
    //address contractaddress ;
    //投票人集合
   // mapping(address =>uint256 )public voters;
   //mapping (address => uint256) public _balances;
   mapping(address => Voter) public Voters;
   //mapping(uint => Candidate) public candidates;
    constructor() ERC20("VoteT", "VT")public{
        //totalSupply = 10000;
        //_name = "voteToken";
        //_symbol = "VTK";
      //  decimals = 0;
      //_totalSupply = 10000;
        votercount = 0;
        candidatesCount = 0;
        addCandidate("zhang1");
        addCandidate("wan2");
        addCandidate("li3");
        //a=msg.sender;
       //Voters[]=Voter{votedToken:0,eventNum:0,votedEvent:voteNumOfCandidate{CandidateId:0,votedNum:0},redeemVote:false};
     //   contractaddress = address(this);
        //_balances[msg.sender]=10000;
        _mint(msg.sender, 10000);
        totalballot = 10000;

    }
    function addCandidate (string memory _name) public {
        candidatesCount ++;
        Candidates[candidatesCount] = Candidate( _name, 0);

    }
    //查询候选人人数
    function queryCandidateNum() public  view returns(uint ){
        return candidatesCount;
    }
    //查询已经投票的数量
    function queryVote()public view virtual  returns(uint256 num){
        return totalballot-totalSupply();
    }
    //query the voting status of  tthe voter
    function queryVoterBallot(address addr,uint256 eventNumber)public view virtual returns(uint256,uint256 ){
        require(addr!= address(0)," ?????address is 0   ");
        Voter storage v = Voters[addr];
        uint256 id = v.votedEvent[eventNumber].CandidateId;
        uint256 num = v.votedEvent[eventNumber].votedNum;
        
        return(id,num);
    }
    /*
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
    */
    function sendballot(address addr ,uint256 amount)public returns(bool success){
        require(balanceOf(msg.sender)>=amount );
        transfer(addr,amount);
        emit ballotsend(msg.sender,amount);
        return true;


    }
    function votefrom(uint256 amount,uint _candidateId)public  returns(bool success){
        
        require(balanceOf(msg.sender)>=amount );
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        //subT(msg.sender, amount); 
         //transfer(msg.sender,contractaddress);
        _burn(msg.sender,amount);
        //addvoter(msg.sender, amount);
        Candidates[_candidateId].voteCount +=amount;
        Voter storage c = Voters[msg.sender];
        c.votedToken +=amount;
        uint256 _eventNum = c.eventNum;
        c.redeemVote = true;
        c.votedEvent[_eventNum++] = voteNumOfCandidate({CandidateId:_candidateId,votedNum:amount});
        c.eventNum++;
        

        emit voted(msg.sender, _candidateId,amount);

        return true;
    }
    function redeemVoterballot()public returns(bool success){
        require(Voters[msg.sender].redeemVote, "the address already redeem token");

        //balanceOf(addr)+=Voters[addr].votedToken;
        // _balances[msg.sender]+=Voters[addr].votedToken;
        _mint(msg.sender,Voters[msg.sender].votedToken);
        Voters[msg.sender].votedToken = 0;
        Voters[msg.sender].redeemVote = false;
        return true;
    }

/*
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
    */
}