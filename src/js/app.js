App = {
  loading: false,
  contracts: {},
  manfdisplay:0,
  admindisplay:1,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    //var Web3 = require('web3')  ;  
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {

      //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        App.acc=await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = App.acc[0];  
    
  },
  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const Medicine = await $.getJSON('Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine)
    App.contracts.Medicine.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
  },
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }
    // Update app loading state
      App.setLoading(true)      
      var home = $("#home");  
      var adminpage = $("#adminpage");  
      var register = $("#register");   
      var manufacturer =$("#manufacturer");
      var display =$("#display");
      var editpage=$("#editmedicine");
      var deletemedicinepage=$("#deletemedicine");
      var crudOperation = $("#btnFun");
      var distributorpage=$('#distributorpage');

      var user=await App.medicine.users(App.account);
      console.log(user);
      var role=user.role;
      var approved=user.approved;
      console.log("role="+role);      
      var username=user.name;

      

      $("[id='accountAddress']").html(username+"("+App.account+")");
      // if(role=="1"){
      //   //End User
      // }
      // else if(role=="2"){
      //   //C.A
      // }
      if(approved.localeCompare("false")==0){
        alert("Waiting for approval from admin");
        return
      }else if(approved.localeCompare("reject")==0){
        alert("Sorry, you cannot login to our website");
        return

      }
        if(role=="3"){
          //Distributor
          $("#displayMedicine").empty();
        var count= await App.medicine.medicineCount();
        console.log(count);
        for (var i = 1; i <= count; i++) {
           var medicine=await App.medicine.medicines(i);
           console.log(medicine);
           var accountaddrees=medicine[2];
            var id=medicine[0];
             var medname=medicine[1];  
             //Display name of manufacturer from ethereum address    
             var user=await App.medicine.users(medicine[2]);
             var manfact=user.name;      
             var expdate=medicine[5]
             var category=medicine[6];
             var price=medicine[7];
             var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td><button class='btn btn-info'>Buy</button></td></tr>";
             $("#displayMedicine").append(str); 
        }

        console.log("approved distributor");
        distributorpage.show();
        home.hide();
        register.hide();
        display.hide();
        editpage.hide();
        deletemedicinepage.hide();
        manufacturer.hide();
        crudOperation.hide();

      }
        
        else if(role=="4"){
          // crudOperation.show();
          //Manufacturer
          
          distributorpage.hide();
          if(App.manfdisplay==0){
            //Display Add Medicine Page
            home.hide();
            register.hide();
            display.hide();
            editpage.hide();
            deletemedicinepage.hide();
            manufacturer.show();
            crudOperation.show();
          }
          if(App.manfdisplay==1){
            //Display View Medicine Page
            home.hide();
            register.hide();          
            manufacturer.hide();
            editpage.hide();
            deletemedicinepage.hide();
            display.show();
            crudOperation.show();
          } 
          if(App.manfdisplay==2){
            //Edit Medicine Medicine Page
            home.hide();
            register.hide();          
            manufacturer.hide();
            display.hide();
            deletemedicinepage.hide();
            editpage.show();
            crudOperation.show();
          } 
          if(App.manfdisplay==3){
            //Delete Medicine Medicine Page
            home.hide();
            register.hide();          
            manufacturer.hide();
            display.hide();          
            editpage.hide();
            adminpage.hide();
            deletemedicinepage.show();
            crudOperation.show();
          } 
        }
        else{

         
          admin=await App.medicine.admin();       
          if(admin.toUpperCase().localeCompare(App.account.toUpperCase())==0){
            window.location.replace('Admin/index.html');
            
          }
          else{
            //New User
            //New User
              home.hide();
              manufacturer.hide();
              display.hide(); 
              deletemedicinepage.hide();                    
              editpage.hide();
              adminpage.hide();
              register.show();
              crudOperation.hide();
              distributorpage.hide();
          }
          
        }
  
     
      
      
   // $('#account').html(App.account)
      // const medicinesCount = await App.medicine.medicineCount();
      // $('#count').append(medicinesCount.toString())
      // Render Tasks
      //await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },
  

  registerRole:async ()=>{
    var userFullname=$("#userFullname").val();
    var userAddress=$("#userAddress").val();
    var role=$("#RoleSelect").val();
    //console.log("Selected role is=",role);     
    console.log("Before sending to BC userAddress="+userAddress+"userRole="+role+"name="+userFullname);
    await App.medicine.registerRoles(userFullname,userAddress,role,"false", { from: App.account });      
    alert("Registered successfully"); 
    await App.render();
  },
  addMedicine:async ()=>{
    var medname=$("#addmedname").val();
    var manfaddrss=App.account;
    // var user=await App.medicine.users(medicine[2]);
    // var manfact=user.name;
    var batchno=$("#addbatchno").val();
    var manfdate=$("#addmanfdate").val();    
    var expdate=$("#addexpdate").val();
    var category=$("#addcategory").val();
    var price=parseInt($("#addprice").val());
    await App.medicine.addMedicine(medname,manfaddrss,batchno,manfdate,expdate,category,price, { from: App.account });  
    await App.render();
    $("#addmedname").val('');    
    $("#addbatchno").val('');
    $("#addmanfdate").val('');    
    $("#addexpdate").val('');
    $("#addcategory").val('');
    $("#addprice").val('');
    alert("Product Added successfully"); 
  },
  displayAddMedicine:async ()=>{
    App.manfdisplay=0;
    await App.render();
  },
  displayViewMedicine:async ()=>{
    //alert("View Button clicked");
    App.manfdisplay=1;
    var displayItem = $('#displayItem');
    displayItem.empty();
    var count= await App.medicine.medicineCount();
    for (var i = 1; i <= count; i++) {
      var medicine=await App.medicine.medicines(i);
      var accountaddrees=medicine[2];
      if(accountaddrees.localeCompare(App.account)==0){
        console.log("match found");
      var id=medicine[0];
      var medname=medicine[1];  
      //Display name of manufacturer from ethereum address    
      var user=await App.medicine.users(medicine[2]);
      var manfact=user.name;      
      var expdate=medicine[5]
      var category=medicine[6];
      var price=medicine[7];
      var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td></tr>";
      displayItem.append(str);
    }
  }
    await App.render();
  },
  displayEditMedicine:async ()=>{
    App.manfdisplay=2;
    var flag=0;
    var medicineSelectEdit=$("#medicineSelectEdit");    
    medicineSelectEdit.empty();
    var count= await App.medicine.medicineCount();
    for (var i = 1; i <= count; i++) {
      console.log("Check select option"+i);
      var medicine=await App.medicine.medicines(i);
      var accountaddrees=medicine[2];
      if(accountaddrees.localeCompare(App.account)==0){
        console.log("match found");
        var id=medicine[0];
        var str = "<option value='" + id + "' >" + id + "</ option>";
        console.log(str);
        medicineSelectEdit.append(str);
        if(flag==0){
          flag=1;
          $("#editmedname").val(medicine[1]);
          $("#editbatchno").val(medicine[3]);
          $("#editmanfdate").val(medicine[4]);
          $("#editexpdate").val(medicine[5]);
          $("#editcategory").val(medicine[6]);
          $("#editprice").val(medicine[7]);
        }
      }      
    }
    await App.render();
  },
  displayDeleteMedicine:async ()=>{
    App.manfdisplay=3;
    var medicineSelectDelete=$("#medicineSelectDelete");    
    var count= await App.medicine.medicineCount();
    for (var i = 1; i <= count; i++) {      
      var medicine=await App.medicine.medicines(i);
      var accountaddrees=medicine[2];
      if(accountaddrees.localeCompare(App.account)==0){        
        var id=medicine[0];
        var str = "<option value='" + id + "' >" + id + "</ option>";        
        medicineSelectDelete.append(str);       
      }      
    }
    await App.render();
  },
  selectedMedicineIDEdit: async ()=>{
    var medicineNumberSelect=parseInt($("#medicineSelectEdit").val());
    var medicine=await App.medicine.medicines(medicineNumberSelect);     
          $("#editmedname").val(medicine[1]);
          $("#editbatchno").val(medicine[3]);
          $("#editmanfdate").val(medicine[4]);
          $("#editexpdate").val(medicine[5]);
          $("#editcategory").val(medicine[6]);
          $("#editprice").val(medicine[7]);
  },
  updateMedicine :async ()=>{
    var medicineNumberSelect=parseInt($("#medicineSelectEdit").val());
    var manfaddrss=App.account;   
    var editmedname= $("#editmedname").val();
    var editbatchno= $("#editbatchno").val();
    var editmanfdate=$("#editmanfdate").val();
    var editexpdate= $("#editexpdate").val();
    var editcategory=$("#editcategory").val();
    var editprice= $("#editprice").val();
    await App.medicine.updateMedicine(medicineNumberSelect,editmedname,manfaddrss,editbatchno,editmanfdate,editexpdate,editcategory,editprice, { from: App.account });  
    await App.render();
  },
  deleteMedicine:async ()=>{
    var medicineSelectDelete=parseInt($("#medicineSelectDelete").val()); 
    await App.medicine.deleteMedicine(medicineSelectDelete, { from: App.account });  
    await App.render(); 
  },
 

}



function loginClick(){
  //alert("MetaMask Connection clicked");
  App.load();
}
