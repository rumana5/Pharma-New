App = {
  loading: false,
  contracts: {},
  manfdisplay:0,
  admindisplay:1,
  allblocks:[],

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  showProductPage :async (id) => {
    //window.alert("clicked view page" +id);
    var med=await App.medicine.medicines(parseInt(id));
    var descdire= await App.medicine.meddescdirections(parseInt(id));
    var description=descdire.description;
    var direction=descdire.direction;    
     //console.log(med);
    var price=med.price;
    var qty=med.quantity;
    //window.alert(price);
    //window.alert(price);
    $("#displayprice").html(price.toString());
    $("#displayquantity").html(qty.toString());
    
    $("#displaydescription").html(description);
    $("#displaydirections").html(direction);    
    var str=`<button type="button" class="btn btn-primary" data-toggle='modal' data-target='#exampleModalLong' onclick="App.trackProduct('`+id+`')">Track Product</button>`+" "+`<button type="button" class="btn btn-primary" data-toggle='modal' data-target='#exampleModalLong1' onclick="App.viewCertificate()">View Certificate</button>`;
    $("#displaytrackbutton").html(str);

    $("#categorypage").hide();
    $("#productpage").show();
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
  })
  .on('changed', function(event){
      // remove event from local database
      window.alert("event on Changed");
  })
  .on('error', console.error);
},

trackProduct :async (id) => { 
  //window.alert("Tracking ID"+id); 
  //console.log("Tracking");
   // console.log(App.allblocks[0]) ;
    // trackdisplay=$("#trackdisplay");
    var id=parseInt(id);  
    var medicine=await App.medicine.medicines(id); 
    $("#trackdisplayenduser").empty();
    // console.log(App.allblocks);

    for(var i=0;i<App.allblocks[0].length;i++){
      
      var block= App.allblocks[0][i];
      //window.alert(block);
      //console.log("Tracking");
      //.log(block.args[0].toNumber());
      if(block.args[0].toNumber()==id)
      {    
        var user=await App.medicine.users(block.args[2].toString());
        var userName=user.name; 
        var roleName, roleAddress;

        var role = user.role;
         if(role == 4){
           roleName = "Manufacturer Name";
           roleAddress = "Manufacturer Address";

         }
         else{
          roleName = "Distributor Name";
          roleAddress = "Distributor Address";
         }
        console.log(userName);
        
        var str="<table class='table table-bordered' width='100%' cellspacing='0'><tr><th>Medicine Name</th><td>"+block.args[1].toString()+"</td></tr><tr><th>"+roleName+"</th><td>"+userName+"</td></tr> <tr><th>"+roleAddress+"</th><td>"+block.args[2].toString()+"</td></tr><tr><th>Batch No</th><td>"+block.args[3].toString()+"</td></tr><tr><th>Manufacture Date</th><td>"+block.args[4].toString()+"</td></tr><tr><th>Expiry Date</th><td>"+block.args[5].toString()+"</td></tr><tr><th>Category</th><td>"+block.args[6].toString()+"</td></tr><tr><th>Qty</th><td>"+block.args[7].toNumber().toString()+"</td> </table>";
          console.log("Tracking") ;
          $("#trackdisplayenduser").append(str);                                                    
      } 
   }
   
  },

  loadHome :async () => {
    //window.alert("Home display");

    $("#categorypage").show();
    $("#productpage").hide();

    $("#displaymedicinesofdistributer").empty();
    await App.loadContract1();
    var count=await App.medicine.medicineforendusersCount();
    for(var i=1;i<=count;i++){
      var medicine=await App.medicine.medicineforendusers(i);
      var med=await App.medicine.medicines(parseInt(medicine.medicineid));
      var price=med.price;
      var descdire= await App.medicine.meddescdirections(parseInt(medicine.medicineid));
      var description=descdire.description;
      var direction=descdire.direction;
     
      //var description=med.description
      var str=`<div class="big-box col-md-5"><div class="big-img-box"><img src="images/product/2.jpg" alt="#" /></div><div class="big-dit-b clearfix"><div class="col-md-6"><div class="left-big"><h3>${medicine.medicinename}</h3><p>${description}</p><div class="prod-btn"><a href="#"><i class="fa fa-star" aria-hidden="true"></i> Save to wishlist</a></div></div></div<div class="col-md-6"><div class="right-big-b"><div class="tight-btn-b clearfix"><button class="btn btn-primary" onclick="App.showProductPage('`+medicine.medicineid+`')">View</button><a href="#">${price}</a></div></div></div></div></div><div class="col-md-1"></div>`
     
      $("#displaymedicinesofdistributer").append(str);
    }
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
  loadContract1: async () => {
    // Create a JavaScript version of the smart contract
    const Medicine = await $.getJSON('Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine);

    //if hosted in kovan or rinkeby then use  "https://rinkeby.infura.io/v3/..." istead of localhost
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    App.contracts.Medicine.setProvider(web3.currentProvider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
    App.listenForEvents();
  },
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }
    // Update app loading state
      App.setLoading(true)      
      var home = $("#home");  
      var register = $("#register");   


      var user=await App.medicine.users(App.account);
      console.log(user);
      var role=user.role;
      var approved=user.approved;
      console.log("role="+role);      
      var username=user.name;

   
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
          window.location.replace('Distributor/index.html');
          }
        
        else if(role=="4"){
          // crudOperation.show();
          //Manufacturer

          window.location.replace('Manufacturer/index.html');
          
          
          
        }
        else{

         
          admin=await App.medicine.admin();       
          if(admin.toUpperCase().localeCompare(App.account.toUpperCase())==0){
            window.location.replace('Admin/index.html');
            
          }
          else{
            //New User
            //New User


             // home.hide();
              window.location.replace('./Register.html');

              
              // register.show();
             
          }
          
        }
  
      App.setLoading(false)
    },

    viewCertificate:async ()=>{
      var certificateAddress= "0xaF7eD4e8e423F81d1F543eC5eFc382943121129e";
      var baseURL = "https://app.certificateok.de/api/certificate/";
    
      $.ajax({
    
          url: "https://app.certificateok.de/api/certificate/0x2fcd5be391Beb9Ce874b117fD3D50cCBA172C2bB",
          method:"GET"
      
        }).done(function(data){
          $('#viewCert').empty();
          for (const [key, value] of Object.entries(data)) {
          $("#viewCert").append("<div>" + `${key}: ${value}` + "</div>");
       
        }
        }).fail(function(err){
          console.log({err});
    });
    
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

}
$(function () {
  $(window).load(function () {
       App.loadHome();
  })
});


function loginClick(){
  //alert("MetaMask Connection clicked");
  App.load();
}
