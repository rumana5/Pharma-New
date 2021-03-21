App = {
  web3Provider: null,
  contracts: {},
  metamaskAccountID: "0x0000000000000000000000000000000000000000",
  admindisplay:2,
  distributordisplay:1,
  allblocks:[],
  
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
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const Medicine = await $.getJSON('../Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine)
    App.contracts.Medicine.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
    App.listenForEvents();
    
    await App.render();
    loadcart();
  },

  render: async () => {

    $("#displayMedicine").empty();
    var count= await App.medicine.medicineCount();
    var user=await App.medicine.users(App.account);
    var username=user.name;
    $("[id='user']").html(username);
    console.log(App.distributordisplay);
    if(App.distributordisplay==1){
      console.log(count);
      for (var i = 1; i <= count; i++) {
        var medicine=await App.medicine.medicines(i);
        var accountaddrees=medicine[2];
         var id=medicine[0];
          var medname=medicine[1]; 
          console.log(medname); 
          //Display name of manufacturer from ethereum address    
          var user=await App.medicine.users(medicine[2]);
          var manfact=user.name;      
          var expdate=medicine[5]
          var category=medicine[6];
          var price=medicine[7];
          var available_Qty=medicine[8];
         //  var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+available_Qty+"</td><td><a href='../Cart/index.html'><button class='btn btn-info'>Add</button></a></td><td><button class='btn btn-info' data-toggle='modal' data-target='#exampleModalLong' onclick='App.trackMedicineByDistributer(`"+id+"`)'>Track</button></td><td><button class='btn btn-info' data-toggle='modal' data-target='#exampleModalLong1' onclick='App.viewCertificate()'>View</button></td></tr>";
         //  $("#displayMedicine").append(str); 
         var btn=`<a href='#0' class='cd-add-to-cart js-cd-add-to-cart btn btn-info' data-price=${price} med-name=${medname} med-id=${id}>Add</a>  <div class='cd-cart cd-cart--empty js-cd-cart'><a href='#0' class='cd-cart__trigger text-replace'> Cart  <ul class='cd-cart__count'> <li>0</li><li>0</li> </ul> </a><div class='cd-cart__content'> <div class='cd-cart__layout'><header class='cd-cart__header'> <h2>Cart</h2> <span class='cd-cart__undo'>Item removed. <a href='#0'>Undo</a></span>  </header>  <div class='cd-cart__body'> <ul>  </ul>  </div>   <footer class='cd-cart__footer'>  <a style='cursor: pointer;' onclick='App.proceedToBuyByDistributer()' class='cd-cart__checkout'><em>Checkout - $<span>0</span> <svg class='icon icon--sm' viewBox='0 0 24 24'><g fill='none' stroke='currentColor'><line stroke-width='2' stroke-linecap='round' stroke-linejoin='round' x1='3' y1='12' x2='21' y2='12'/><polyline stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='15,6 21,12 15,18 '/></g>  </svg>  </em>  </a> </footer>  </div></div>  </div> `;
          var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+available_Qty+"</td><td>"+btn+"</td><td><button class='btn btn-info' data-toggle='modal' data-target='#exampleModalLong' onclick='App.trackMedicineByDistributer(`"+id+"`)'>TRACK</button></td><td><button class='btn btn-info' data-toggle='modal' data-target='#exampleModalLong1' onclick='App.viewCertificate(`"+medname+"`)'>VIEW</button></td></tr>";
          $("#displayMedicine").append(str); 
     }      
    $("#distributorpage").show(); 
    $("#payemtsuccesspage").hide();
    $('#displaypurcahsedmedicine').hide();
    $("#distributermainpage").show(); 
    $("#ordermanagement").hide(); 

    }else if(App.distributordisplay==2){
      $("#displayItem").empty();
      for(var i=1;i<=count;i++){
        var medicine=await App.medicine.medicineforendusers(i);
        var med=await App.medicine.medicines(parseInt(medicine.medicineid));
        var price=med.price;
        var accountaddrees=med.manufaname;
        console.log(accountaddrees);
        var id=med.id;
        var medname=med.medname;  
        //Display name of manufacturer from ethereum address    
         var user=await App.medicine.users(accountaddrees);
         var manfact=user.name;      
         var expdate=med.expdate;
         var category=med.category;
         var price=med.price;
         var available_Qty=med.quantity;
        
          //var btn= "<a href='#0' class='cd-add-to-cart js-cd-add-to-cart' data-price='25.99'>Add To Cart</a>  <div class='cd-cart cd-cart--empty js-cd-cart'><a href='#0' class='cd-cart__trigger text-replace'> Cart  <ul class='cd-cart__count'> <li>0</li><li>0</li> </ul> </a><div class='cd-cart__content'> <div class='cd-cart__layout'><header class='cd-cart__header'> <h2>Cart</h2> <span class='cd-cart__undo'>Item removed. <a href='#0'>Undo</a></span>  </header>  <div class='cd-cart__body'> <ul>  </ul>  </div>   <footer class='cd-cart__footer'>  <a href='#0' class='cd-cart__checkout'><em>Checkout - $<span>0</span> <svg class='icon icon--sm' viewBox='0 0 24 24'><g fill='none' stroke='currentColor'><line stroke-width='2' stroke-linecap='round' stroke-linejoin='round' x1='3' y1='12' x2='21' y2='12'/><polyline stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='15,6 21,12 15,18 '/></g>  </svg>  </em>  </a> </footer>  </div></div>  </div> ";
           //var btn=" <main class='cd-main container margin-top-xxl'><div class='text-component text-center'><p class='flex flex-wrap flex-center flex-gap-xxs'><a href='#0' class='cd-add-to-cart js-cd-add-to-cart' data-price='10'>Add To Cart</a></p></div></main>";
           //var btn="<a href='#0' class='cd-add-to-cart js-cd-add-to-cart' data-price='18'>Add To Cart</a>  <div class='cd-cart cd-cart--empty js-cd-cart'><a href='#0' class='cd-cart__trigger text-replace'> Cart  <ul class='cd-cart__count'> <li>0</li><li>0</li> </ul> </a><div class='cd-cart__content'> <div class='cd-cart__layout'><header class='cd-cart__header'> <h2>Cart</h2> <span class='cd-cart__undo'>Item removed. <a href='#0'>Undo</a></span>  </header>  <div class='cd-cart__body'> <ul>  </ul>  </div>   <footer class='cd-cart__footer'>  <a href='#0' class='cd-cart__checkout'><em>Checkout - $<span>0</span> <svg class='icon icon--sm' viewBox='0 0 24 24'><g fill='none' stroke='currentColor'><line stroke-width='2' stroke-linecap='round' stroke-linejoin='round' x1='3' y1='12' x2='21' y2='12'/><polyline stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='15,6 21,12 15,18 '/></g>  </svg>  </em>  </a> </footer>  </div></div>  </div> ";
          
          var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td>"+available_Qty+"</td></tr>";
          console.log(str);
         $("#displayItem").append(str); 
          //$("#checking").append(chk); 
     }
     $("#distributorpage").hide(); 
     $("#payemtsuccesspage").hide();
     $('#displaypurcahsedmedicine').show();
     $("#ordermanagement").hide(); 
    }else{
      $("#displayOrders").empty();
    var totalstatuses=await App.medicine.orderStatusCount();       
    for (var i = 1; i <= totalstatuses; i++) {      
      var orderstatus=await App.medicine.orderstatuses(i);     
      var medid=orderstatus[1];
      var qty=orderstatus[2];
      var manufacturer=orderstatus[3];
      var distributer=orderstatus[4];
      var user=await App.medicine.users(manufacturer);
      var username=user.name;
      var status=orderstatus[5]; 
      if(distributer.toUpperCase().localeCompare(App.account.toUpperCase())==0){     
        //found 
        var str="";
        if(status=="0"){
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><tr>"                 
        }
        if(status=="1"){
          //purchased by distributer Need to accept
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting For Order Accepted</td><tr>"  
         
        }
        if(status=="2"){
          //Accepted the order Need to ship
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Order Accepted.Waiting For Shipping</td><tr>"  
         
        }
        if(status=="3"){
          //Product Shipped MArk as wating for Delivery confirmation
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Shipped</td><td><button class='btn btn-info' onclick='App.markSatusAsCompleted(`"+i+"`)'>Mark as Delivered</button></td><tr>"  
         
        }
        if(status=="4"){
          //Product Shipped MArk as wating for Delivery confirmation
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting Delivery Confirmation</td><tr>"  
         
        }
        if(status=="5"){
          //Product Delivered by the Distributer
          str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Product Delivered</td><tr>"  
         
        }   
        $("#displayOrders").append(str);       
      }      
    }
    $("#distributorpage").hide(); 
     $("#payemtsuccesspage").hide();
     $('#displaypurcahsedmedicine').hide();
     $("#ordermanagement").show(); 
    }
      
  },
  markSatusAsCompleted :async (id)=>{
    await App.medicine.updateOrderStatus(parseInt(id),"5",{from:App.account});
    await App.render();
  },
  showOrderManagementPage :async ()=>{
    App.distributordisplay = 3;
    // $("#displayOrders").empty();
    // var totalstatuses=await App.medicine.orderStatusCount();       
    // for (var i = 1; i <= totalstatuses; i++) {      
    //   var orderstatus=await App.medicine.orderstatuses(i);     
    //   var medid=orderstatus[1];
    //   var qty=orderstatus[2];
    //   var manufacturer=orderstatus[3];
    //   var distributer=orderstatus[4];
    //   var user=await App.medicine.users(manufacturer);
    // var username=user.name;
    //   var status=orderstatus[5]; 
    //   if(distributer.toUpperCase().localeCompare(App.account.toUpperCase())==0){     
    //     //found 
    //     var str="";
    //     if(status=="0"){
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><tr>"                 
    //     }
    //     if(status=="1"){
    //       //purchased by distributer Need to accept
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting For Order Accepted</td><tr>"  
         
    //     }
    //     if(status=="2"){
    //       //Accepted the order Need to ship
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Order Accepted.Waiting For Shipping</td><tr>"  
         
    //     }
    //     if(status=="3"){
    //       //Product Shipped MArk as wating for Delivery confirmation
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Shipped</td><td><button class='btn btn-info' onclick='App.markSatusAsCompleted(`"+i+"`)'>Mark as Delivered</button></td><tr>"  
         
    //     }
    //     if(status=="4"){
    //       //Product Shipped MArk as wating for Delivery confirmation
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting Delivery Confirmation</td><tr>"  
         
    //     }
    //     if(status=="5"){
    //       //Product Delivered by the Distributer
    //       str = "<tr><td>" + medid +"</td><td>"+manufacturer+"</td><td>"+username+"</td><td>"+qty+"</td><td>Product Delivered</td><tr>"  
         
    //     }   
    //     $("#displayOrders").append(str);       
    //   }      
    // }
    await App.render();


      // $("#distributorpage").hide();
      // $("#distributorBuypage").hide();
      // $("#ordermanagement").show();
      // $("#payemtsuccesspage").hide();
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
  
      $('#distributorpage').hide();
      $('#distributorBuypage').show();
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

trackMedicineByDistributer:async (id)=>{
  //window.alert("Tracking ID"+id); 
  //console.log("Tracking");
   // console.log(App.allblocks[0]) ;
    // trackdisplay=$("#trackdisplay");
    var id=parseInt(id);  
    var medicine=await App.medicine.medicines(id); 
    $("#trackdisplay").empty();
    // console.log(App.allblocks);
    var user=await App.medicine.users(medicine[2]);
    var manfact=user.name;
    
    for(var i=0;i<App.allblocks[0].length;i++){
      
      var block= App.allblocks[0][i];
      //window.alert(block);
      //console.log("Tracking");
      //.log(block.args[0].toNumber());
      if(block.args[0].toNumber()==id)
      {    
        var str="<table class='table table-bordered' width='100%' cellspacing='0'><tr><th>Medicine Name</th><td>"+block.args[1].toString()+"</td></tr><tr><th>Manufacturer Name</th><td>"+manfact+"</td></tr> <tr><th>Manufacturer Address</th><td>"+block.args[2].toString()+"</td></tr><tr><th>Batch No</th><td>"+block.args[3].toString()+"</td></tr><tr><th>Manufacture Date</th><td>"+block.args[4].toString()+"</td></tr><tr><th>Expiry Date</th><td>"+block.args[5].toString()+"</td></tr><tr><th>Category</th><td>"+block.args[6].toString()+"</td></tr><tr><th>Qty</th><td>"+block.args[7].toNumber().toString()+"</td> </table>";
          console.log("Tracking") ;
          $("#trackdisplay").append(str);                                                    
      } 
  }
  
},


proceedToBuyByDistributer: async (id)=>{
  var cart = document.getElementsByClassName('js-cd-cart');
  var cartTotal = cart[0].getElementsByClassName('cd-cart__checkout')[0].getElementsByTagName('span')[0].innerText;    
  $("#distributermainpage").hide(); 
  $("#payemtsuccesspage").show();
  //window.alert("purchased")   ;
  $("#totalamountforcreditcard").append(cartTotal);

},

completepaymentbyDistributer: async ()=>{
  //var inputqty=parseInt($("#buyingQtyByDistr").val());
//window.alert(inputqty);
//var id=parseInt(id); 
var cart = document.getElementsByClassName('js-cd-cart');
if(cart.length > 0) {
  var cartAddBtns = document.getElementsByClassName('js-cd-add-to-cart'),
  cartBody = cart[0].getElementsByClassName('cd-cart__body')[0],
  cartList = cartBody.getElementsByTagName('ul')[0],
  cartListItems = cartList.getElementsByClassName('cd-cart__product'),
  cartTotal = cart[0].getElementsByClassName('cd-cart__checkout')[0].getElementsByTagName('span')[0],
  cartCount = cart[0].getElementsByClassName('cd-cart__count')[0],
  cartCountItems = cartCount.getElementsByTagName('li'),
  cartUndo = cart[0].getElementsByClassName('cd-cart__undo')[0];
}
var products = cartList.getElementsByClassName('cd-cart__body');

//console.log(cartListItems);
var total_amount=0;
    for(var i = 0; i < cartListItems.length; i++) {         
        var Quantity = cartListItems[i].getElementsByTagName('select')[0].value;
        console.log("quantiy="+Quantity);            
       var  price1 =cartListItems[i].getElementsByClassName('cd-cart__price')[0].innerText;
       console.log("price="+price1);       
       var  medicineId =cartListItems[i].getElementsByClassName('med-id-cart')[0].innerText;
       console.log("Medicine Id="+medicineId); 
        var medicine=await App.medicine.medicines(parseInt(medicineId));       
        var id=medicine[0]; 
        var manufactaddress=medicine[2]; 
        var inputqty=parseInt(Quantity)   
        var price=parseInt(medicine[7]);
        var available_Qty=parseInt(medicine[8]);
        if(inputqty>available_Qty){
          window.alert("Quatity Not Avilable To Buy");
        }
        else{
          window.alert("Transaction for amount= "+inputqty*price);
          total_amount+=inputqty*price;
          await App.medicine.buyMedicineByDistributer(id,manufactaddress,inputqty, { from: App.account });               
        } 
    }
    window.alert("Completed successfully");
    await App.render();
},

viewCertificate:async (name)=>{
  var certificateAddress='';
      console.log(name);

      if(name.localeCompare("Dolonex Disp 20MG Tabs")==0 || name.localeCompare("DISP 20MG TABS")==0){
        certificateAddress="0x089f03b202470b872b7e2c84c7a6815033382140";
        console.log("enter");
      }else if(name.localeCompare("Aspirin")==0 || name.localeCompare("Aspirin 500 mg Tabs")==0){
        certificateAddress="0x4C21bb8b30DBd4aFBC7Ea0e4F52a0aF90c50082C";
        console.log(certificateAddress);
      }else if(name.localeCompare("ATPARK 25MG")==0 || name.localeCompare("ATPARK")==0){
        certificateAddress ="0x0AB8F188F7F950e91c6dB8f745B124A15B0B5d5F";
      }else if(name.localeCompare("Anacin Tabs")==0){
        certificateAddress="0x7A4D996385985A39a245786aB7524C1a9ca0fE98";
      }

      //certificateAddress= "0x089f03b202470b872b7e2c84c7a6815033382140";
      var baseURL = "https://app.certificateok.de/api/certificate/";
      var certOk = "https://www.certificateok.de/wp-content/uploads/2016/04/certificate_ok_black_Zeichenfläche-1.png";
    

  $.ajax({

    url: baseURL + certificateAddress,
    method:"GET"
  
    }).done(function(data){
      $('#viewCert').empty();

          document.getElementById("logoProp").src = `${certOk}`;

          var jsonData = '';
          if(data.valid)
          
            jsonData=`<table class='tableCert table-borderless' width='100%' cellspacing='0'><colgroup><col span="1" style="width: 40%;"><col span="1" style="width: 60%;"></colgroup><tr><th>Holder of Certificate:</th><td>${data.holder}</td></tr><tr><th>Certification Mark:</th><td><img alt="" src="${data.cbLogo}" height="100" width="100"></td></tr><tr><th>Certificate Number:</th><td>${data.number}</td></tr><tr><th>Product Name:</th><td>${data.model}</td></tr><tr><th>Product Category:</th><td>${data.product}</td></tr><tr><th>Standards:</th><td>${data.standard}</td></tr><tr><th>Issued Date:</th><td>${data.issued}</td></tr><tr><th>Expired Date:</th><td>${data.expired}</td></tr><tr><th>Valid:</th><td><i class="fa fa-check-circle fa-2x" style="color:green;"></i></i></td></tr> </table>`;

          else
            jsonData=`<table class='tableCert table-borderless' width='100%' cellspacing='0'><colgroup><col span="1" style="width: 40%;"><col span="1" style="width: 60%;"></colgroup><tr><th>Holder of Certificate:</th><td>${data.holder}</td></tr><tr><th>Certification Mark:</th><td><img alt="" src="${data.cbLogo}" height="100" width="100"></td></tr><tr><th>Certificate Number:</th><td>${data.number}</td></tr><tr><th>Product Name:</th><td>${data.model}</td></tr><tr><th>Product Category:</th><td>${data.product}</td></tr><tr><th>Standards:</th><td>${data.standard}</td></tr><tr><th>Issued Date:</th><td>${data.issued}</td></tr><tr><th>Expired Date:</th><td>${data.expired}</td></tr><tr><th>Valid:</th><td><i class="fa fa-times-circle fa-2x" style="color:red;"></i></i></td></tr> </table>`;
             
          $("#viewCert").append(jsonData);
   
    
    }).fail(function(err){
      console.log({err});
});

},
displayMedicine:async ()=>{
  //alert("View Button clicked");
  App.distributordisplay=1;
 
  await App.render();
},
displayPurchasedMedicine:async ()=>{
  //alert("View Button clicked");
  App.distributordisplay=2;
 
  await App.render();
},

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

function loadcart(){
  // Add to Cart Interaction - by CodyHouse.co
  //window.alert("initial");
  var cart = document.getElementsByClassName('js-cd-cart');
  if(cart.length > 0) {
  	var cartAddBtns = document.getElementsByClassName('js-cd-add-to-cart'),
  		cartBody = cart[0].getElementsByClassName('cd-cart__body')[0],
  		cartList = cartBody.getElementsByTagName('ul')[0],
  		cartListItems = cartList.getElementsByClassName('cd-cart__product'),
  		cartTotal = cart[0].getElementsByClassName('cd-cart__checkout')[0].getElementsByTagName('span')[0],
  		cartCount = cart[0].getElementsByClassName('cd-cart__count')[0],
  		cartCountItems = cartCount.getElementsByTagName('li'),
  		cartUndo = cart[0].getElementsByClassName('cd-cart__undo')[0],
  		productId = 0, //this is a placeholder -> use your real product ids instead
  		cartTimeoutId = false,
  		animatingQuantity = false;
		initCartEvents();


		function initCartEvents() {
			// add products to cart
			for(var i = 0; i < cartAddBtns.length; i++) {(function(i){
				cartAddBtns[i].addEventListener('click', addToCart);
			})(i);}

			// open/close cart
			cart[0].getElementsByClassName('cd-cart__trigger')[0].addEventListener('click', function(event){
				event.preventDefault();
				toggleCart();
			});
			
			cart[0].addEventListener('click', function(event) {
				if(event.target == cart[0]) { // close cart when clicking on bg layer
					toggleCart(true);
				} else if (event.target.closest('.cd-cart__delete-item')) { // remove product from cart
					event.preventDefault();
					removeProduct(event.target.closest('.cd-cart__product'));
				}
			});

			// update product quantity inside cart
			cart[0].addEventListener('change', function(event) {
				if(event.target.tagName.toLowerCase() == 'select') quickUpdateCart();
			});

			//reinsert product deleted from the cart
			cartUndo.addEventListener('click', function(event) {
				if(event.target.tagName.toLowerCase() == 'a') {
					
					event.preventDefault();
					if(cartTimeoutId) clearInterval(cartTimeoutId);
					// reinsert deleted product
					var deletedProduct = cartList.getElementsByClassName('cd-cart__product--deleted')[0];
					Util.addClass(deletedProduct, 'cd-cart__product--undo');
					deletedProduct.addEventListener('animationend', function cb(){
						deletedProduct.removeEventListener('animationend', cb);
						Util.removeClass(deletedProduct, 'cd-cart__product--deleted cd-cart__product--undo');
						deletedProduct.removeAttribute('style');
						quickUpdateCart();
					});
					Util.removeClass(cartUndo, 'cd-cart__undo--visible');
				}
			});
		};

		function addToCart(event) {
			//window.alert("clicked");
      //console.log(event);
			event.preventDefault();
			if(animatingQuantity) return;
			var cartIsEmpty = Util.hasClass(cart[0], 'cd-cart--empty');
			//update cart product list
      //console.log("checking name"+this);
			addProduct(this,this.getAttribute('data-price'),this.getAttribute('med-name'),this.getAttribute('med-id'));
			//update number of items 
			updateCartCount(cartIsEmpty);
			//update total price
			updateCartTotal(this.getAttribute('data-price'), true);
			//show cart
			Util.removeClass(cart[0], 'cd-cart--empty');
		};

		function toggleCart(bool) { // toggle cart visibility
			var cartIsOpen = ( typeof bool === 'undefined' ) ? Util.hasClass(cart[0], 'cd-cart--open') : bool;
		
			if( cartIsOpen ) {
				Util.removeClass(cart[0], 'cd-cart--open');
				//reset undo
				if(cartTimeoutId) clearInterval(cartTimeoutId);
				Util.removeClass(cartUndo, 'cd-cart__undo--visible');
				removePreviousProduct(); // if a product was deleted, remove it definitively from the cart

				setTimeout(function(){
					cartBody.scrollTop = 0;
					//check if cart empty to hide it
					if( Number(cartCountItems[0].innerText) == 0) Util.addClass(cart[0], 'cd-cart--empty');
				}, 500);
			} else {
				Util.addClass(cart[0], 'cd-cart--open');
			}
		};

		function addProduct(target,price,medname,medid) {
			// this is just a product placeholder
			// you should insert an item with the selected product info
			// replace productId, productName, price and url with your real product info
			// you should also check if the product was already in the cart -> if it is, just update the quantity
			productId = productId + 1;
      //window.alert("check price="+price)
      //var productAdded = '<li class="cd-cart__product"><div class="cd-cart__image"><a href="#0"><img src="assets/img/product-preview.png" alt="placeholder"></a></div><div class="cd-cart__details"><h3 class="truncate"><a href="#0">Product Name</a></h3><span class="cd-cart__price">'+price+'</span><div class="cd-cart__actions"><a href="#0" class="cd-cart__delete-item">Delete</a><div class="cd-cart__quantity"><label for="cd-product-'+ productId +'">Qty</label><span class="cd-cart__select"><select class="reset" id="cd-product-'+ productId +'" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select><svg class="icon" viewBox="0 0 12 12"><polyline fill="none" stroke="currentColor" points="2,4 6,8 10,4 "/></svg></span></div></div></div></li>';
      //Here you can increase number of quantity
			var productAdded = '<li class="cd-cart__product"><div class="cd-cart__image"><a href="#0"><img src="assets/img/product-preview.png" alt="placeholder"></a></div><div class="cd-cart__details"><h3 class="truncate"><a href="#0">'+medname+'</a></h3><span class="med-id-cart" style="display: none;">'+medid+'</span><span class="cd-cart__price">'+price+'</span><div class="cd-cart__actions"><a href="#0" class="cd-cart__delete-item">Delete</a><div class="cd-cart__quantity"><label for="cd-product-'+ productId +'">Qty</label><span class="cd-cart__select"><select class="reset" id="cd-product-'+ productId +'" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select><svg class="icon" viewBox="0 0 12 12"><polyline fill="none" stroke="currentColor" points="2,4 6,8 10,4 "/></svg></span></div></div></div></li>';
			cartList.insertAdjacentHTML('beforeend', productAdded);
      //console.log("Check full product"+cartList);
		};

		function removeProduct(product) {
			if(cartTimeoutId) clearInterval(cartTimeoutId);
			removePreviousProduct(); // prduct previously deleted -> definitively remove it from the cart
			
			var topPosition = product.offsetTop,
				productQuantity = Number(product.getElementsByTagName('select')[0].value),
				productTotPrice = Number((product.getElementsByClassName('cd-cart__price')[0].innerText).replace('$', '')) * productQuantity;

			product.style.top = topPosition+'px';
			Util.addClass(product, 'cd-cart__product--deleted');

			//update items count + total price
			updateCartTotal(productTotPrice, false);
			updateCartCount(true, -productQuantity);
			Util.addClass(cartUndo, 'cd-cart__undo--visible');

			//wait 8sec before completely remove the item
			cartTimeoutId = setTimeout(function(){
				Util.removeClass(cartUndo, 'cd-cart__undo--visible');
				removePreviousProduct();
			}, 8000);
		};

		function removePreviousProduct() { // definitively removed a product from the cart (undo not possible anymore)
			var deletedProduct = cartList.getElementsByClassName('cd-cart__product--deleted');
			if(deletedProduct.length > 0 ) deletedProduct[0].remove();
		};

		function updateCartCount(emptyCart, quantity) {
			if( typeof quantity === 'undefined' ) {
				var actual = Number(cartCountItems[0].innerText) + 1;
				var next = actual + 1;
				
				if( emptyCart ) {
					cartCountItems[0].innerText = actual;
					cartCountItems[1].innerText = next;
					animatingQuantity = false;
				} else {
					Util.addClass(cartCount, 'cd-cart__count--update');

					setTimeout(function() {
						cartCountItems[0].innerText = actual;
					}, 150);

					setTimeout(function() {
						Util.removeClass(cartCount, 'cd-cart__count--update');
					}, 200);

					setTimeout(function() {
						cartCountItems[1].innerText = next;
						animatingQuantity = false;
					}, 230);
				}
			} else {
				var actual = Number(cartCountItems[0].innerText) + quantity;
				var next = actual + 1;
				
				cartCountItems[0].innerText = actual;
				cartCountItems[1].innerText = next;
				animatingQuantity = false;
			}
		};

		function updateCartTotal(price, bool) {
			cartTotal.innerText = bool ? (Number(cartTotal.innerText) + Number(price)).toFixed(2) : (Number(cartTotal.innerText) - Number(price)).toFixed(2);
		};

		function quickUpdateCart() {
			var quantity = 0;
			var price = 0;

			for(var i = 0; i < cartListItems.length; i++) {
				if( !Util.hasClass(cartListItems[i], 'cd-cart__product--deleted') ) {
					var singleQuantity = Number(cartListItems[i].getElementsByTagName('select')[0].value);
					quantity = quantity + singleQuantity;
					price = price + singleQuantity*Number((cartListItems[i].getElementsByClassName('cd-cart__price')[0].innerText).replace('$', ''));
				}
			}

			cartTotal.innerText = price.toFixed(2);
			cartCountItems[0].innerText = quantity;
			cartCountItems[1].innerText = quantity+1;
		};
    
  }
};




