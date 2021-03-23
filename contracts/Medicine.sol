// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Medicine {
 uint public medicineCount = 0;
 uint public usersCount = 0;
 uint public orderStatusCount=0;
 uint public orderStatusCountEndUser=0;
 uint public medicineforendusersCount = 0;
 uint public distributorQuantity = 0;
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
   struct OrderStatus{
    uint id;
    uint medid;
    uint qty;
    address manufacturer;
    address distributer;
    string status;
    //"1" means initiated "2" means accepted "3" means shipped "4" completed
  }
  mapping(uint => OrderStatus ) public orderstatuses;
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

  struct OrderStatusEndUser{
    uint id;
    uint medid;
    uint qty;
    address distributer;
    address enduser;
    string status;
    //"1" means initiated "2" means accepted "3" means shipped "4" completed
  }
  mapping(uint => OrderStatusEndUser ) public orderstatusesofenderusers;

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
    function updateOrderStatus(uint _id,string memory _status) public {      
        uint _medid=orderstatuses[_id].medid;
        uint _qty=orderstatuses[_id].qty; 
        address _manufacturer=orderstatuses[_id].manufacturer;
        address _distributer=orderstatuses[_id].distributer;        
        orderstatuses[_id]=OrderStatus(_id,_medid,_qty,_manufacturer,_distributer,_status);        
    }
    function buyMedicineByDistributer(uint _id,address _manufact,uint _qty) public  {
      distributorQuantity=_qty;
      uint _quanity=medicines[_id].quantity-_qty;
      string memory _medname=medicines[_id].medname;
      address _manufaname=medicines[_id].manufaname;
      string memory _batchNo=medicines[_id].batchNo;
      string memory _manufadate=medicines[_id].manufadate;
      string memory _expdate=medicines[_id].expdate;
      string memory _category=medicines[_id].category;
      uint _price=medicines[_id].price;    
        
      medicines[_id] = Med(_id, _medname,_manufaname,_batchNo,_manufadate,_expdate,_category,_price,_quanity);

      emit updatedMedicine(_id, _medname,msg.sender,_batchNo, _manufadate,_expdate,_category, distributorQuantity);
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

      //Status updation
      orderStatusCount++;
      orderstatuses[orderStatusCount]=OrderStatus(orderStatusCount,_id,_qty,_manufact,msg.sender,"1");     
      
    }

    function buyMedicineByEndUser(uint _id,uint _qty) public  {      
          uint _medicineid=medicineforendusers[_id].medicineid;
          string memory _medicinename=medicineforendusers[_id].medicinename;
          address _distributer=medicineforendusers[_id].distributer;     
          uint _newqty=medicineforendusers[_id].qty-_qty;
          medicineforendusers[_id]=MedicineForEndUser(_id,_medicineid,_medicinename,_distributer,_newqty);
          //status update of end user       
          orderStatusCountEndUser++;
          orderstatusesofenderusers[orderStatusCountEndUser]=OrderStatusEndUser(orderStatusCountEndUser,_medicineid,_qty,_distributer,msg.sender,"1");
    }
     function updateOrderStatusEndUser(uint _id,string memory _status) public { 
        uint _medid=orderstatusesofenderusers[_id].medid;
        uint _qty=orderstatusesofenderusers[_id].qty;         
        address _distributer=orderstatusesofenderusers[_id].distributer; 
        address _enduser=orderstatusesofenderusers[_id].enduser;       
        orderstatusesofenderusers[_id]=OrderStatusEndUser(_id,_medid,_qty,_distributer,_enduser,_status);        
    }
}