App = {
  loading: false,
  contracts: {},
  manfdisplay:0,
  admindisplay:1,
  allblocks:[],
  displayData:0,
  arr:[],
  similarArr:[],

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  showProductPage :async (id) => {
    var med=await App.medicine.medicines(parseInt(id));
    var descdire= await App.medicine.meddescdirections(parseInt(id));
    var description=descdire.description;
    var direction=descdire.direction;    
    var price="€ "+ med.price;
    var qty=med.quantity;
    var user=await App.medicine.users(med.manufaname);
    var username=user.name;
    console.log(username);

    $("#displayprice").html(price.toString());
    $("#displayquantity").html(qty.toString());
    $("#productName").html(med.medname); 
    $("#manufacturerName").html(username); 

    $("#displaydescription").html(description);
    $("#displaydirections").html(direction);  

    var str=`<div class="col-md-4 col-lg-3 viewBtn"><button type="button" class="btn btn-primary btn-block" data-toggle='modal' data-target='#exampleModalLong' onclick="App.trackProduct('`+id+`')">Track Product</button></div>`+" "+`<div class="col-md-4 col-lg-3 viewBtn"><button type="button" class="btn btn-primary btn-block" data-toggle='modal' data-target='#exampleModalLong1' onclick="App.viewCertificate('`+med.medname+`')">View Certificate</button></div>`;

    $("#displaytrackbutton").html(str);
    $("#categorypage").hide();
    
    $("#productpage").show();


    await App.showsimilarproducts(id);
  },

  showsimilarproducts : async(id) => {
    var Category = App.similarArr[id].categoryName;

    $("#displaymedicines").empty();

    for (var i in App.similarArr) 
    {
      if(App.similarArr[i].id != id){

        if(App.similarArr[i].categoryName==Category){

          var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643954/img-1.jpg"> <img class="pic-2" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643955/img1.2.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+App.similarArr[i].id+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${App.similarArr[i].name}</a></h3> <span class="price">${App.similarArr[i].price}</span></div></div></div>`
          $("#displaymedicines").append(str);
        }
      }
    }
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
  }, function(error, event){ 
    //console.log(event); 
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
      console.log(block);
      //console.log("Tracking");
      //.log(block.args[0].toNumber());
      if(block.args[0].toNumber()==id)
      {    
        var user=await App.medicine.users(block.args[2].toString());
        var userName=user.name; 
        var roleName, roleAddress;
        var link="https://kovan.etherscan.io/tx/"+block.transactionHash;
        // var add="https://kovan.etherscan.io/address/0xa1ce9e5c627c8e06d55a169972d7c1a370bbf7fd";
        console.log(block.transactionHash);
        
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
        
        var str="<a class='btn btn-success' href='"+link+"' target=_blank style='margin-bottom:15px; float:right'>View on Etherscan</a><table class='tableTrack table-striped table-borderless' width='100%' cellspacing='0'><tr><th>Medicine Name</th><td>"+block.args[1].toString()+"</td></tr><tr><th>"+roleName+"</th><td>"+userName+"</td></tr> <tr><th>"+roleAddress+"</th><td>"+block.args[2].toString()+"</td></tr><tr><th>Batch No</th><td>"+block.args[3].toString()+"</td></tr><tr><th>Manufacture Date</th><td>"+block.args[4].toString()+"</td></tr><tr><th>Expiry Date</th><td>"+block.args[5].toString()+"</td></tr><tr><th>Category</th><td>"+block.args[6].toString()+"</td></tr><tr><th>Qty</th><td>"+block.args[7].toNumber().toString()+"</td> </table>";
          console.log("Tracking") ;
          $("#trackdisplayenduser").append(str);                                                    
      } 
   }
   
  },

  loadHome :async () => {

    var clickedCategory = localStorage.getItem("categoryName");

    if(clickedCategory!="All")

      $("[id='nameCategory']").html(clickedCategory);
    
    var options = '';
    
    $("#categorypage").show();
    $("#productpage").hide();
    $('#boxscroll').empty();
    $("#displaymedicinesofdistributer").empty();

    await App.loadContract1();
    var count=await App.medicine.medicineforendusersCount();
    for(var i=1;i<=count;i++){
      var medicine=await App.medicine.medicineforendusers(i);
      var med=await App.medicine.medicines(parseInt(medicine.medicineid));
      var category = await med.category;

      var manufactName = med.manufaname;
      var user=await App.medicine.users(manufactName);
      var username=user.name;
      var price=med.price + " €";

      if(App.displayData==0){

        var found = App.arr.some(el => el.name === username);
  
        if(category==clickedCategory){
          
          App.similarArr.push({ id: medicine.medicineid,name: medicine.medicinename, price: price, categoryName: category });

          if(found){
        
          } else {
           App.arr.push({ id: App.arr.length + 1,name: username, status: true });
          } 

        } else if(clickedCategory=="All"){

          App.similarArr.push({ id: medicine.medicineid,name: medicine.medicinename, price: price, categoryName: category });
         
          if(found){
        
          } else {
           App.arr.push({ id: App.arr.length + 1,name: username, status: true });
          } 
        }

      }

      let obj = App.arr.find((o) => {
        if (o.name === username) {
          if(category == clickedCategory){
            if(o.status){
              var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a href="#"> <img class="pic-1" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643954/img-1.jpg"> <img class="pic-2" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643955/img1.2.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a href="">${medicine.medicinename}</a></h3> <span class="price"></span><span class="price">${price}</span></div></div></div>`
              $("#displaymedicinesofdistributer").append(str);
            }
            return true;

          }else if(clickedCategory == "All"){
            if(o.status){
            var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a href="#"> <img class="pic-1" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643954/img-1.jpg"> <img class="pic-2" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643955/img1.2.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a href="">${medicine.medicinename}</a></h3> <span class="price"></span><span class="price">${price}</span></div></div></div>`
            $("#displaymedicinesofdistributer").append(str);
            }
          }
        }
      });
    }

    for (var i in App.arr) 
    {
      if(App.arr[i].status)
          options += '<input type="checkbox" class="filled-in chk-col-blue" name="checkbox" id="checkbox-' + i + '" value="' + i + '" class="custom" checked="true" onchange="App.myFunction(this);" />';
      else
          options += '<input type="checkbox" class="filled-in chk-col-blue" name="checkbox" id="checkbox-' + i + '" value="' + i + '" class="custom" onchange="App.myFunction(this);" />';
           
      options += '<label for="checkbox-' + i + '">' + App.arr[i].name + '</label>';
      options += '<br>';

      $('#boxscroll').append(options);      
      options = '';   
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
    // web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/84f14847ade746d6a1265dcb3c518972"));
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    App.contracts.Medicine.setProvider(web3.currentProvider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
    App.listenForEvents();
  },
  myFunction:async(elem)=>{

    App.displayData=1;

    var manuName = $("#"+elem.id).next().text();
    
    if (elem.checked)
    {
      console.log("checked");
      for (var i in App.arr) {
        if (App.arr[i].name == manuName) {
          App.arr[i].status = true;
          break; 
        }
      }
    }
    else
    {
      console.log("unchecked");
      for (var i in App.arr) {
        if (App.arr[i].name == manuName) {
         App.arr[i].status = false;
         break;
        }
      }
    }
    await App.loadHome();
  },

  searchMedicineByEndUser :async () =>{
    $("#close").show();
    var mednamesearch=$("#medicinesearchbyEndUser").val();    
      // window.alert("Home display");
      $("#displaysearchedmedicine").empty();
      await App.loadContract1();
      var count=await App.medicine.medicineforendusersCount();
      for(var i=1;i<=count;i++){
        var medicine=await App.medicine.medicineforendusers(i);
        var med=await App.medicine.medicines(parseInt(medicine.medicineid));
        var price=med.price;
        var medicinename=med[1];
        var descdire= await App.medicine.meddescdirections(parseInt(medicine.medicineid));
        var description=descdire.description;
        var direction=descdire.direction;
        var str="";
        console.log(medicinename+" "+mednamesearch);
        if(medicinename.toLowerCase().localeCompare(mednamesearch.toLowerCase())==0){

          console.log("search");
         
           str=`<div class="col-md-4 col-sm-6 searchimg"><div class="product-grid2"><div class="product-image2"> <a href="#"> <img class="pic-1" id="pic-1" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643954/img-1.jpg"></a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProduct()" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a href="">${medicine.medicinename}</a></h3> <span class="price">${price}</span></div></div></div>`
          
          }  
          console.log(str);

        //var description=med.description       
        $("#displaysearchedmedicine").append(str);
      }
      // $("#displaycategories").hide();
      $("#displaysearchedmedicine").show();
      //await App.render();
  },

  clearSearch :async () =>{
    $('#displaysearchedmedicine').hide();
    document.getElementById('medicinesearchbyEndUser').value = '';
    $("#close").hide();

    await App.loadContract1();
  },

  

  

  showAllMedicines :async () => {
    //window.alert("Home display");
    
   

    $("#showAllMedicines").empty();
    await App.loadContract1();
    
    var count=await App.medicine.medicineforendusersCount();
    
    for(var i=1;i<=count;i++){
      var medicine=await App.medicine.medicineforendusers(i);
      var med=await App.medicine.medicines(parseInt(medicine.medicineid));

      var manufactName = med.manufaname;
      var user=await App.medicine.users(manufactName);
      var username=user.name;
      var price=med.price + " €";
      var descdire= await App.medicine.meddescdirections(parseInt(medicine.medicineid));
      var description=descdire.description;
      var direction=descdire.direction;

     
      //var description=med.description
      //var str=`<div class="big-box col-md-5"><div class="big-img-box"><img src="images/product/2.jpg" alt="#" /></div><div class="big-dit-b clearfix"><div class="col-md-6"><div class="left-big"><h3>${medicine.medicinename}</h3><p>${description}</p><div class="prod-btn"><a href="#"><i class="fa fa-star" aria-hidden="true"></i> Save to wishlist</a></div></div></div><div class="col-md-6"><div class="right-big-b"><div class="tight-btn-b clearfix"><button class="btn btn-primary" onclick="App.showProductPage('`+medicine.medicineid+`')">View</button><a href="#">${price}</a></div></div></div></div></div>`
      var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a href="#"> <img class="pic-1" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643954/img-1.jpg"> <img class="pic-2" src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1561643955/img1.2.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li><li><a href="#" data-tip="Add to Cart"><i class="fa fa-shopping-cart"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a href="">${medicine.medicinename}</a></h3> <span class="price">${price}</span></div></div></div>`
      $("#showAllMedicines").append(str);

      
    $("#showAllMedicines").show();
    }
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

$(function () {
  $(window).load(function () {
      
       App.showAllMedicines();
  })
});

  


function clicked(item) {
  console.log($(item).attr("id"));

  localStorage.setItem("categoryName",$(item).attr("id"));

  window.location.replace('./category.html');


 }

function loginClick(){
  //alert("MetaMask Connection clicked");
  App.load();
  

}
