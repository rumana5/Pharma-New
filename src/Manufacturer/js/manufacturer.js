App = {
    web3Provider: null,
    contracts: {},
    manfdisplay:1,
    allblocks:[],
    
    load: async function () {
        return await App.initWeb3();
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                //await window.ethereum.enable();
                App.acc= await ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();
        return App.loadContract();;
    },

    //Get Metamask Account
    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        App.account = App.acc[0];

    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const Medicine = await $.getJSON('../Medicine.json')
      App.contracts.Medicine = TruffleContract(Medicine)
      App.contracts.Medicine.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.medicine = await App.contracts.Medicine.deployed()
      App.listenForEvents();

      return App.render();
    },

    render: async () => {
      
      var manufacturer =$("#manufacturer");
      var display =$("#display");
      var editpage=$("#editmedicine");
      var deletemedicinepage=$("#deletemedicine");
      var ordermanagementpage=$("#ordermanagementpage");
  
      var user=await App.medicine.users(App.account);

      var role=user.role;
  
      var approved=user.approved;
             
      var username=user.name;

      $("[id='accountAddress']").html(username +" ("+App.account+")");
      $("[id='username']").html(username);

      if(App.manfdisplay==0){
          //Display Add Medicine Page
          
          display.hide();
          editpage.hide();
          deletemedicinepage.hide();
          manufacturer.show();
          ordermanagementpage.hide();
         
      }
      if(App.manfdisplay==1){
          //Display View Medicine Page
                    
          manufacturer.hide();
          editpage.hide();
          deletemedicinepage.hide();
          ordermanagementpage.hide();
          display.show();

          var displayItem = $('#displayItem');
          displayItem.empty();
          var count= await App.medicine.medicineCount();

          for (var i = 1; i <= count; i++) {
            var medicine=await App.medicine.medicines(i);
            var accountaddrees=medicine[2];
            
            if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){
              
              var id=medicine[0];
              var medname=medicine[1];  
              
              var user=await App.medicine.users(medicine[2]);
              var manfact=user.name;      
              var expdate=medicine[5]
              var category=medicine[6];
              var price=medicine[7];
              var quantity=medicine[8];
              var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+quantity+"</td></tr>";
              displayItem.append(str);
            }
          }
          
      } 
      if(App.manfdisplay==2){
          //Edit Medicine Medicine Page
                
          manufacturer.hide();
          display.hide();
          deletemedicinepage.hide();
          ordermanagementpage.hide();
          editpage.show();
          
      } 
      if(App.manfdisplay==3){
          //Delete Medicine Medicine Page
                  
          manufacturer.hide();
          ordermanagementpage.hide();
          display.hide();          
          editpage.hide();
          deletemedicinepage.show();
          
      } 
      if(App.manfdisplay==4){
          //Show Order Management Page
                  
          manufacturer.hide();
          ordermanagementpage.show();
          display.hide();          
          editpage.hide();
          deletemedicinepage.hide();

          $("#displayOrders").empty();
          var totalstatuses=await App.medicine.orderStatusCount();       
          for (var i = 1; i <= totalstatuses; i++) {      
            var orderstatus=await App.medicine.orderstatuses(i);     
            var medid=orderstatus[1];
            var med=await App.medicine.medicines(parseInt(medid));
            if(med.medname!=''){
              var qty=orderstatus[2];
              var manufacturer=orderstatus[3];
              var distributer=orderstatus[4];
              var status=orderstatus[5]; 
              var user=await App.medicine.users(distributer);
              var username=user.name;

              if(manufacturer.toUpperCase().localeCompare(App.account.toUpperCase())==0){     
                //found 
                var str="";
                if(status=="0"){
                  str = "<tr><td>" + medid +"</td><td>"+med.medname+"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><tr>"                 
                }
                if(status=="1"){
                  //purchased by distributer Need to accept
                  str = "<tr><td>" + medid +"</td><td>"+med.medname+"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><td><button class='btn btn-info' onclick='App.markSatusAsAccept(`"+i+"`)'>Mark As Accept</button></td><tr>"  
           
                }
                if(status=="2"){
                  //Accepted the order Need to ship
                  str = "<tr><td>" + medid +"</td><td>"+med.medname+"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><td><button class='btn btn-info' onclick='App.markSatusAsShipped(`"+i+"`)'>Mark As Shipped</button></td><tr>"  
           
                }
                if(status=="3"){
                  //Product Shipped MArk as wating for Deleivery confirmation
                  str = "<tr><td>" + medid+"</td><td>"+med.medname +"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting Delivery Confirmation</td><tr>"  
           
                }
                if(status=="4"){
                  //Product Shipped MArk as wating for Deleivery confirmation
                  str = "<tr><td>" + medid+"</td><td>"+med.medname +"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting Delivery Confirmation</td><tr>"  
           
                }
                if(status=="5"){
                  //Product Delivered by the Distributer
                  str = "<tr><td>" + medid +"</td><td>"+med.medname+"</td><td>"+distributer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Product Delivered</td><tr>"  
           
                }   
                $("#displayOrders").append(str);    
              }   
            }      
          }
      } 
    }, 
    markSatusAsAccept :async (id)=>{
      await App.medicine.updateOrderStatus(parseInt(id),"2", { from: App.account });
      await App.render();
    },
    markSatusAsShipped :async (id)=>{
      await App.medicine.updateOrderStatus(parseInt(id),"3", { from: App.account });
      await App.render();
    },
    
    //Medicine added to Blockchain
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
      var quantity=parseInt($("#addquantity").val());
      var adddescription=$("#adddescription").val();
      var adddirection=$("#adddirection").val();
      await App.medicine.addMedicine(medname,manfaddrss,batchno,manfdate,expdate,category,price,quantity,adddescription,adddirection, { from: App.account });  
      await App.render();
      $("#addmedname").val('');    
      $("#addbatchno").val('');
      $("#addmanfdate").val('');    
      $("#addexpdate").val('');
      $("#addcategory").val('');
      $("#addprice").val('');
      $("#adddescription").val('');
      $("#adddirection").val('');
      $("#addquantity").val('');
      alert("Product Added successfully"); 
    },

    //Listen for events emitted from the contract
listenForEvents:async  function() {   
  var instance=await App.contracts.Medicine.deployed();

    instance.getPastEvents("updatedMedicine", { fromBlock: 0 }).then((events) => {
      //window.alert("previous event");
      App.allblocks.push(events);
      
    });
    instance.contract.events.updatedMedicine({
      filter: {}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
  }, function(error, event){ //console.log(event); 
  })
  .on('data', function(event){
      //console.log(event); // same results as the optional callback above
      //window.alert("event cPTURD");
      App.allblocks.push(event); 
      console.log(App.allblocks);
  })
  .on('changed', function(event){
      // remove event from local database
      window.alert("event on Changed");
  })
  .on('error', console.error);
},

displayAddMedicine:async ()=>{
  App.manfdisplay=0;
  await App.render();
},

displayViewMedicine:async ()=>{
    App.manfdisplay=1;
    await App.render();
},
    
//Edit Medicnes Details
displayEditMedicine:async ()=>{
    App.manfdisplay=2;
    var flag=0;
    var medicineSelectEdit=$("#medicineSelectEdit");    
    medicineSelectEdit.empty();
    var count= await App.medicine.medicineCount();
    for (var i = 1; i <= count; i++) {
        
        var medicine=await App.medicine.medicines(i);
        var accountaddrees=medicine[2];
        if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){
          var id=medicine[0];
          var str = "<option value='" + id + "' >" + id + "</ option>";
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
   
//Delete Medicines 
displayDeleteMedicine:async ()=>{
      App.manfdisplay=3;
      var medicineSelectDelete=$("#medicineSelectDelete");    
      var count= await App.medicine.medicineCount();
      medicineSelectDelete.empty();
      for (var i = 1; i <= count; i++) {      
        var medicine=await App.medicine.medicines(i);
        var accountaddrees=medicine[2];
        if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){        
          var id=medicine[0];
          var str = "<option value='" + id + "' >" + id + "</ option>";        
          medicineSelectDelete.append(str);       
        }      
      }
      await App.render();
},
    
displayOrderManagementPage:async ()=>{
      App.manfdisplay=4;     
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
    }
};

(function($) {

  $(window).load(function () {
    App.load();
  });
  "use strict";

  // Add active state to sidbar nav links
  var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
      $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
          if (this.href === path) {
              $(this).addClass("active");
          }
      });

  // Toggle the side navigation
  $("#sidebarToggle").on("click", function(e) {
      e.preventDefault();
      $("body").toggleClass("sb-sidenav-toggled");
  });
})(jQuery);

