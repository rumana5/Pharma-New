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

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        // web3.eth.getAccounts(function (err, res) {
        //     if (err) {
        //         console.log('Error:', err);
        //         return;
        //     }
        //     App.account = res[0];

        //     console.log('getMetaskID:', App.account);
        // })

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
      // Prevent double render
     
      // Update app loading state     
      
      
      var manufacturer =$("#manufacturer");
      var display =$("#display");
      var editpage=$("#editmedicine");
      var deletemedicinepage=$("#deletemedicine");
     
  
        var user=await App.medicine.users(App.account);
        console.log(user);
        var role=user.role;
  
        var approved=user.approved;
        console.log("role="+role);      
        var username=user.name;

        $("[id='accountAddress']").html(username +" ("+App.account+")");
        $("[id='username']").html(username);
        
  
        console.log(role);
  

         if(App.manfdisplay==0){
          //Display Add Medicine Page
          
          display.hide();
          editpage.hide();
          deletemedicinepage.hide();
          manufacturer.show();
         
        }
        if(App.manfdisplay==1){
          console.log("enter");
          //Display View Medicine Page
                    
          manufacturer.hide();
          editpage.hide();
          deletemedicinepage.hide();
          display.show();

          var displayItem = $('#displayItem');
          displayItem.empty();
          var count= await App.medicine.medicineCount();
          console.log(count+"hi");
          for (var i = 1; i <= count; i++) {
            var medicine=await App.medicine.medicines(i);
            var accountaddrees=medicine[2];
            console.log(accountaddrees + "bye" + App.account);
            if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){
              console.log("match found");
            var id=medicine[0];
            var medname=medicine[1];  
            //Display name of manufacturer from ethereum address    
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
          editpage.show();
          
        } 
        if(App.manfdisplay==3){
          //Delete Medicine Medicine Page
                  
          manufacturer.hide();
          display.hide();          
          editpage.hide();
          deletemedicinepage.show();
          
        } 
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
      //alert("View Button clicked");
      App.manfdisplay=1;
     
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
        if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){
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
        if(accountaddrees.toUpperCase().localeCompare(App.account.toUpperCase())==0){        
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

