// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Medicine {
 uint public medicineCount = 0;
 uint public usersCount = 0;
 uint public medicineforendusersCount = 0;
 address public admin;
  struct Med {
    uint id;    
    string medname;
    address manufaname;
    string batchNo;
    string manufadate;
    string expdate;
    string category;
    uint price;
    uint quantity;
  }
  mapping(uint => Med) public medicines;
  struct MedDescDirection{
    uint id;
    string description;
    string direction;
  }
   mapping(uint => MedDescDirection ) public meddescdirections;
  struct User {       
    string name;
    string addr;
    string role;
    string approved;    
  } 
  
   mapping(address => User) public users;
  struct MedicineForEndUser {       
    uint id;
    uint medicineid;
    string medicinename;
    address distributer ;
    uint qty;
  }  
  mapping(uint => MedicineForEndUser) public medicineforendusers;
  address[] public addresses;

   // event 
    event updatedMedicine (
        uint  id,    
        string medname,
        address manufaname,
        string batchNo,
        string manufadate,
        string expdate,
        string category,
        //uint price,
        uint quantity      
    );

  constructor() public {  
    admin=msg.sender;    
  }

 function addMedicine (string memory _medname,address _manufaname,string memory  _batchNo,string memory _manufadate,string memory _expdate,string memory _category,uint _price,uint _quantity,string memory _desc,string memory _directions) public {
        medicineCount ++;
        medicines[medicineCount] = Med(medicineCount, _medname,_manufaname,_batchNo, _manufadate,_expdate,_category,_price,_quantity);
        meddescdirections[medicineCount]=MedDescDirection(medicineCount,_desc,_directions);
        //emit addedProduct(productCount,msg.sender,_name,_date,_time,_productinfo);
        emit updatedMedicine(medicineCount, _medname,_manufaname,_batchNo, _manufadate,_expdate,_category,_quantity);
    }
  function updateMedicine (uint _id,string memory _medname,address _manufaname,string memory  _batchNo,string memory _manufadate,string memory _expdate,string memory _category,uint _price) public {
        uint _quanity=medicines[_id].quantity;
        medicines[_id] = Med(_id, _medname,_manufaname,_batchNo, _manufadate,_expdate,_category,_price,_quanity);
        //emit addedProduct(productCount,msg.sender,_name,_date,_time,_productinfo);
        emit updatedMedicine(medicineCount, _medname,_manufaname,_batchNo, _manufadate,_expdate,_category,_quanity);
    } 
  function deleteMedicine (uint _id) public {
      delete(medicines[_id]);
      delete  meddescdirections[_id];

      //emit addedProduct(productCount,msg.sender,_name,_date,_time,_productinfo);
  }  
  function registerRoles (string memory _name,string memory _address,string memory _role,string memory _approved) public {
        require(bytes(users[msg.sender].role).length<=0);
        users[msg.sender] = User(_name,_address,_role,_approved);
        addresses.push(msg.sender);
        usersCount++;
        //emit registeredEvent(msg.sender);
    }
    function approveUser (address _address,string memory _approved) public {
        //require(msg.sender==admin);
        string memory _name=users[_address].name;
        string memory _addr=users[_address].addr;
        string memory _role=users[_address].role;
        users[_address] = User(_name,_addr,_role,_approved);        
        //emit registeredEvent(msg.sender);
    }
    function buyMedicineByDistributer(uint _id,uint _qty) public  {
      uint _quanity=medicines[_id].quantity-_qty;
      string memory _medname=medicines[_id].medname;
      address _manufaname=medicines[_id].manufaname;
      string memory _batchNo=medicines[_id].batchNo;
      string memory _manufadate=medicines[_id].manufadate;
      string memory _expdate=medicines[_id].expdate;
      string memory _category=medicines[_id].category;
      uint _price=medicines[_id].price;    
        
      medicines[_id] = Med(_id, _medname,_manufaname,_batchNo,_manufadate,_expdate,_category,_price,_quanity);

      _quanity = _qty;

      emit updatedMedicine(_id, _medname,msg.sender,_batchNo, _manufadate,_expdate,_category, _quanity);
       uint _newentry=1;
      uint i=1;
      for(i=1;i<=medicineforendusersCount;i++){
        if((medicineforendusers[i].distributer==msg.sender)&&(medicineforendusers[i].medicineid==_id)){
          uint newqty=medicineforendusers[i].qty+_qty;
          medicineforendusers[i]=MedicineForEndUser(i,_id,_medname,msg.sender,newqty);
          _newentry=0;
          break;
        }
      }
      if(_newentry==1){
        medicineforendusersCount++;
        medicineforendusers[medicineforendusersCount]=MedicineForEndUser(medicineforendusersCount,_id,_medname,msg.sender,_qty);
      }
      
    }
}