App = {
  web3Provider: null,
  contracts: {},
  metamaskAccountID: "0x0000000000000000000000000000000000000000",
  admindisplay:2,
  
  load: async function () {
      
      /// Setup access to blockchain
      return await App.initWeb3();


  },

  initWeb3: async function () {
      /// Find or Inject Web3 Provider
      /// Modern dapp browsers...
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
    App.getMetaskAccountID();
        

        return App.loadContract();;
  },

  getMetaskAccountID: function () {
      web3 = new Web3(App.web3Provider);
      App.account = App.acc[0];

      // Retrieving accounts
      // web3.eth.getAccounts(function (err, res) {
      //     if (err) {
      //         console.log('Error:', err);
      //         return;
      //     }
      //     App.metamaskAccountID = res[0];
      //     console.log('getMetaskID:', App.metamaskAccountID);
      // })

  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const Medicine = await $.getJSON('../Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine)
    App.contracts.Medicine.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()

    return App.render();
  },

  render: async () => {

    var distributorpage=$('#distributorpage');
    var distributorBuypage=$('#distributorBuypage');

    $("#displayMedicine").empty();
    var count= await App.medicine.medicineCount();
    console.log(count);
    var user=await App.medicine.users(App.account);
    var username=user.name;
    $("[id='user']").html(username);

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
         var available_Qty=medicine[8];
         var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+available_Qty+"</td><td><button class='btn btn-info' onclick='App.buyMedicineByDistributer(`"+id+"`)'>Buy</button></td><td><button class='btn btn-info'>Track</button></td></tr>";
         $("#displayMedicine").append(str); 
    }
            

  },

  buyMedicineByDistributer:async (id)=>{
    window.alert(id);
    var id=parseInt(id);
    $("#displayMedicineforBuy").empty();   
    var medicine=await App.medicine.medicines(id);       
    var id=medicine[0];
     var medname=medicine[1];  
     //Display name of manufacturer from ethereum address    
     var user=await App.medicine.users(medicine[2]);
     var manfact=user.name;      
     var expdate=medicine[5]
     var category=medicine[6];
     var price=medicine[7];
     var available_Qty=medicine[8];
     var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+available_Qty+"</td><td><input type='number' class='form-control' id='buyingQtyByDistr'></td></tr><tr>"+
     "<td colspan='8' align='center'><button type='button' class='btn btn-primary' onclick='App.proceedToBuyByDistributer(`"+id+"`)' >Procced to Buy</button></td></tr>";
     $("#displayMedicineforBuy").append(str); 
     var home = $("#home");  
      var adminpage = $("#adminpage");  
      var register = $("#register");   
      var manufacturer =$("#manufacturer");
      var display =$("#display");
      var editpage=$("#editmedicine");
      var deletemedicinepage=$("#deletemedicine");
      var crudOperation = $("#btnFun");
      var distributorpage=$('#distributorpage');
      var distributorBuypage=$('#distributorBuypage');
    
     distributorpage.hide();
     distributorBuypage.show();
},
proceedToBuyByDistributer: async (id)=>{
  var inputqty=parseInt($("#buyingQtyByDistr").val());
  //window.alert(inputqty);
  var id=parseInt(id);      
  var medicine=await App.medicine.medicines(id);       
  var id=medicine[0];     
  var price=parseInt(medicine[7]);
  var available_Qty=parseInt(medicine[8]);
  if(inputqty>available_Qty){
    window.alert("Quatity Not Avilable To Buy");
  }
  else{
    window.alert("Puchased "+inputqty*price);
    await App.medicine.buyMedicineByDistributer(id,inputqty, { from: App.account }); 
    await App.render();
  }

},

  viewCertificate:async ()=>{
    $.ajax({
      url: "https://app.certificateok.de/api/certificate/0xaF7eD4e8e423F81d1F543eC5eFc382943121129e",
      contentType: "application/json",
      type: 'GET',
      dataType: 'json',
      success: function (response) {
          var data = response.results;
          console.log(data);
      }
  });

}
 
};

$(function () {
  $(window).load(function () {
      App.load();
  });
});


// menu hide
    (function($) {
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


