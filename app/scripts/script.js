angular.module('eventosAktum', ['ui.router','angularUtils.directives.dirPagination','ngConfirm','tooltips'])

.config(function($stateProvider, $locationProvider,$urlRouterProvider,paginationTemplateProvider) {

  //pagination 
  paginationTemplateProvider.setPath('../../node_modules/angular-utils-pagination/dirPagination.tpl.html');

  $locationProvider.html5Mode(false).hashPrefix('!');
  //$locationProvider.html5Mode(false);

  $stateProvider.state({
    name: 'category',
    url: '/catalogo/:categorySlug',
    templateUrl: 'product_list.html',
    controller: 'listProducts',
    params: {reload: true} //add reload param to a view you want to reload
  }).state({
    name: 'individual',
    url: '/individual/:producto_codigo',
    templateUrl: 'product_view.html'
  }).state({
    name: 'carrito',
    url: '/carrito',
    templateUrl: 'cart-view.html'
  }).state({
    name: 'main',
    url: '/',
    templateUrl: 'views/main_page_random_products.html',
    contoller: 'mainPageRandomProducts',
  }).state('busqueda', {
    url: '/busqueda/:palabra_clave',
    templateUrl: 'views/search_results.html',
    controller: 'searchProductsController'
  }).state({
    name: 'cotizacion',
    url: '/cotizacion',
    templateUrl: 'quotation-view.html'});

  $urlRouterProvider.otherwise('/');

}).run(function($rootScope, $http, $log,$localstorage,$window) {
	$rootScope.carrito={ };
	$rootScope.carrito.productos=[]; 
	
	if($window.localStorage['Carrito']==null ||$window.localStorage['Carrito']==undefined){
		$localstorage.setObject('Carrito',$rootScope.carrito.productos);
		$log.log("CARRITO INICIALIZADO");
	}


	$rootScope.categories = [];
	$http.post('https://www.promocionalesapi.com/api/v1/categoria.php', {'accion': 'listar'})
	  // appSharedService.serverCall("categoria", "listas", {}).then;
    .then(function(response) {
		  //----------------- Get data from api -------------------//
			var allCategories = response.data // Get all categories, without filtering
			// Filter categories omitting null and special
     var mainCategories = allCategories.categorias.filter(function(categoryItem){
      if(categoryItem.id_parent === null
        && categoryItem.special == 0)
        return true;
    });
			  //-------------End get data from api --------------------//
			  
			  angular.forEach(mainCategories, function(cat, catIdx) {
          cat.subcategories = allCategories.categorias.filter(function(categoryItem) {
           if(categoryItem.id_parent === cat.id_categoria)
            return true;
        });
          $rootScope.categories.push(cat);
        });
			  //$log.log(self.cats);
		  // });

      // Data for random products displayed on index page
      $rootScope.randomProducts = [];
      $http.post('https://www.promocionalesapi.com/api/v1/producto.php', {'accion': 'listar-productos-aleatorios' , 'cantidad': 4}).then(function(response){
        $rootScope.randomProducts =  response.data.productos;

      });
      //$log.log($rootScope.categories);
    }); 

  })

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})

.controller('mainPage', ['$http', '$log','$scope', '$rootScope','$stateParams','$state', 
  function($http, $log,$scope, $rootScope,$stateParams,$state){


    $scope.getSelectedCat =function(item)
    {
      $rootScope.selectedCat=item;
      $log.log($rootScope.selectedCat);

    }
    $scope.reload=function(){
      $state.reload();
    }

  }])

.controller('mainRandom',  function($http, $log,$scope, $rootScope){

	$scope.getProduct =function(item)
  {
  	$rootScope.id=item;
  	$log.log($rootScope.id);

  }
})





.controller('mainPageFooter', ['$http', '$log', '$scope', '$rootScope', '$stateParams', '$state',
  function($http, $log,$scope,$rootScope, $stateParams,$state){

      // var self = this;
      $log.log($rootScope.categories);

      $scope.getSelectedCat =function(item)
      {
        $rootScope.selectedCat=item;
        $log.log($rootScope.selectedCat);
      }
      $scope.reload=function(){
        $state.reload();
      }

    }])


.controller('searchController', function($scope, $log, $location){
  $scope.searchProducts = function (){
    $log.log($scope.palabra_clave);

    if($scope.palabra_clave == '') { 

      $location.path($location.path()); 
    }else {

      if($scope.palabra_clave === undefined){
        $location.path($location.path()); 
      } else {
        $location.path('/busqueda/' + $scope.palabra_clave);
      }
    }
  };
})

.controller('searchProductsController', function($scope, $log, $stateParams, $http){
  $('.searchPLoader').show();  
  // setTimeout(function(){
    // $('.searchLoader').fadeOut()
  // }, 3700);

  $scope.results = [];
  $http.post('https://www.promocionalesapi.com/api/v1/producto.php', 
    {'accion': 'buscar', 'cantidad': 90, 'pagina': 1, 'palabras_clave': $stateParams.palabra_clave }).then(function(response){
      $scope.results = response.data;
      $('.searchPLoader').hide()
    //$log.log($scope.results.productos.length);

  });
    $scope.palabra_clave = $stateParams.palabra_clave;


  })

.service('service', function($http, $q) {
  //https://www.promocionalesapi.com/api/v1/producto.php?accion=individual-codigo&codigo=th-12
  var urlBase="https://www.promocionalesapi.com/api/v1/";
  var data= {
    accion: 'individual-codigo',
    codigo: 'th-12'
  };

  this.serverCall = function(model, action, data) {
    var newData = data || {};
    newData.accion = action;
    var deferred = $q.defer();
    $http({
      method: 'POST',
      data: newData,
      dataType: 'json',
      url: "https://www.promocionalesapi.com/api/v1/"+ model+'.php',
      headers: {
        'content-type': 'application/json'
      }
    }).then(function(result) {
      deferred.resolve(result.data);
    }, function(error) {
      deferred.reject(error);
    });
    return deferred.promise;
  };
}).factory('$localstorage', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}).controller('listProducts', function ($rootScope,$scope,$log, service, $stateParams) {
  // $('.searchPLoader').show();  
  // setTimeout(function(){
  //   $('.searchPLoader').fadeOut()
  // }, 800);
  setTimeout(function(){
    $('.noproducts').show()
  }, 900);


  $log.log($stateParams.categorySlug);

  $('.searchPLoader').show();  
  $scope.promise=service.serverCall("producto", "listar-productos-categoria", {categoria: $stateParams.categorySlug, pagina:"1", cantidad:"500"});

  $scope.productos=[];
  $scope.promise.then(function(data){
    $('.searchPLoader').fadeOut()
    $scope.productos=data.productos;
    for (var i = 0; i <$scope.productos.length; i++) {
      $scope.productos[i].link='/ver/'+$scope.productos[i].codigo;
      $scope.productos[i].imglink='https://promocionalesapi.s3.amazonaws.com/catalogo/md/'+$scope.productos[i].img;
    }
  });
  $scope.getProduct =function(item)
  {
  	$rootScope.id=item;
  	$log.log($rootScope.id);

  }
  

}).controller('viewProduct', function ($rootScope,$scope,$log,service,$localstorage,$stateParams, $location,$window, $http) {
 $scope.codigo= $rootScope.id|| "";
 $scope.promise=service.serverCall("producto", "individual-codigo",{ codigo: $stateParams.producto_codigo });
 if($stateParams.producto_codigo === '') $location.path('/');
 $scope.producto={};
 
 $scope.promise.then(function(data){

  $scope.producto=data.producto;





  $scope.related = [];
  $http.post('https://www.promocionalesapi.com/api/v1/producto.php', 
    {'accion': 'listar-productos-similares', 'cantidad': 4, 'categoria': $scope.producto.categoria_url, 'codigo': $scope.producto.codigo}).then(function(response){
      $scope.related = response.data;

    });




    $scope.producto.imglink='https://promocionalesapi.s3.amazonaws.com/catalogo/lg/'+$scope.producto.modelos[0].img;



    var colores=[];
    var models=[];

    for(var i=0;i<$scope.producto.modelos.length;i++){

     $scope.producto.modelos[i].imglink='https://promocionalesapi.s3.amazonaws.com/catalogo/lg/'+$scope.producto.modelos[i].img;
     $scope.producto.modelos[i].index=i;		
     colores.push($scope.producto.modelos[i].color);
     models.push($scope.producto.modelos[i].adicional);
     $scope.mainImage = $scope.producto.imagenes[0];
     $scope.producto.requiere_logotipo=false;   

   }
   $scope.producto.colores=colores.filter((v, i, a) => a.indexOf(v) === i); 
   $scope.producto.models=models.filter((v, i, a) => a.indexOf(v) === i); 
   $scope.gotColors=false;
   $scope.gotModels=false;
   $scope.producto.imgcolores=[];



   for(var i=0;i<$scope.producto.colores.length;i++){
    if(/^[0-9a-zA-Z]+$/.test($scope.producto.colores[i])){
      $scope.gotColors=true;
    }
  }
  for(var i=0;i<$scope.producto.models.length;i++){
    if(/^[0-9a-zA-Z]+$/.test($scope.producto.models[i])){
      $scope.gotModels=true;
    }
  }

  for(var j=0;j<$scope.producto.colores.length;j++){
    for(var i=0;i<$scope.producto.modelos.length;i++){

      if($scope.producto.colores[j]===$scope.producto.modelos[i].color){
        $scope.producto.imgcolores.push("https://promocionalesapi.s3.amazonaws.com/catalogo/lg/"+$scope.producto.modelos[i].img);
        console.log($scope.producto.colores[j]);
        break;
      }
    }


  }

  $scope.changeImage = function ($index){
    $scope.producto.imglink = 'https://promocionalesapi.s3.amazonaws.com/catalogo/lg/' + $scope.producto.imagenes[$index].imagen;
  };



  $scope.changeModelImage = function($index){

    $('.modelImage').removeClass('activeImage');

    function Image(item){
      setTimeout(function(){

        $('#' + item).addClass("activeImage");

      },50);
    }

    Image('model-' + $index);

  // $scope.producto.imglink = $scope.producto.modelos[$index].imglink;
  $scope.producto.imglink = 'https://promocionalesapi.s3.amazonaws.com/catalogo/lg/' + $scope.producto.modelos[$index].img;



};



});

 

 $scope.valor=true;
 $rootScope.carrito={};
 $rootScope.carrito.productos=[]; 
 $rootScope.carrito.productos=$localstorage.getObject('Carrito');
 $log.log($scope.producto.imgcolores +" Arreglo img");

 $scope.changeColor = function($index){
  // $scope.producto.imglink = $scope.producto.modelos[$index].imglink;
  $scope.producto.imglink = $scope.producto.imgcolores[$index];
  console.log($scope.producto.imgcolores[$index]+" link");
};

$scope.validar= function(product,qty,mindex){
 if(parseInt(qty)>=parseInt(product.minimo_piezas)){
  $log.log("Valor ingresado: "+qty+" - Minimo requerido: "+product.minimo_piezas);
    //$scope.valor=false;

    $scope.addtoCart= function(product,qty,mindex){

      if(typeof(qty)=="number" && qty>0){

       $log.log(product.titulo+" "+qty+" "+mindex);
       product.qty=qty;
       product.cantidad=qty;
       product.selmodel=mindex;
       product.dispimg=product.modelos[mindex].imglink;
       product.color=product.modelos[mindex].color;
       product.img=product.modelos[mindex].img;
       product.id_modelo=product.modelos[mindex].id_modelo;
       $rootScope.carrito.productos=$localstorage.getObject("Carrito");

        //var enCarrito;
        //for (var i = 0; i <$rootScope.carrito.productos.length; i++) {
        //if($rootScope.carrito.productos[i].id_producto===product.id_producto){
        //    $rootScope.carrito.productos[i].qty+=qty;
        //      enCarrito=true;
        //  } 
        //}
        //if(!enCarrito){
          $rootScope.carrito.productos.push(product);
        //}
        $localstorage.setObject("Carrito" ,$rootScope.carrito.productos); 


        swal({
          title: "Producto agregado",
            //text: "",
            type: "success",
            timer: 1400,
          });  


        $('.cart-preview').animate({right: "-1px"}, 600);
        // setTimeout(function(){
        //   $('.cart-preview').animate({right: "-301px"}, 600);
        // }, 3500);

        //$("html, body").animate({ scrollTop: 0 }, 500);
      }
    }
    $scope.addtoCart(product,qty,mindex);

  }
  else{
    $log.log("El valor ingresado es: "+qty+" - Mínimo requerido: "+product.minimo_piezas);

    swal({
      title: "Lo sentimos",
      text: "La cantidad mínima requerida es de " + product.minimo_piezas + " piezas.",
      timer: 2400
    }
    );       

    //$scope.valor= true;
  }
}

// $scope.addtoCart= function(product,qty,mindex){

//   if(typeof(qty)=="number" && qty>0){

//    $log.log(product.titulo+" "+qty+" "+mindex);
//    product.qty=qty;
//    product.cantidad=qty;
//    product.selmodel=mindex;
//    product.dispimg=product.modelos[mindex].imglink;
//    product.color=product.modelos[mindex].color;
//    product.img=product.modelos[mindex].img;
//    product.id_modelo=product.modelos[mindex].id_modelo;
//    $rootScope.carrito.productos=$localstorage.getObject("Carrito");



// 	  		//var enCarrito;
// 	  		//for (var i = 0; i <$rootScope.carrito.productos.length; i++) {
// 		  	//if($rootScope.carrito.productos[i].id_producto===product.id_producto){
// 		  	//		$rootScope.carrito.productos[i].qty+=qty;
// 		  	//			enCarrito=true;
// 		  	//	} 
// 		  	//}
// 		  	//if(!enCarrito){
//           $rootScope.carrito.productos.push(product);
// 		  	//}
//         $localstorage.setObject("Carrito" ,$rootScope.carrito.productos); 


//         $('.cart-preview').animate({right: "-1px"}, 600);
//         setTimeout(function(){
//           $('.cart-preview').animate({right: "-301px"}, 600);
//         }, 3500);

//         $window.scrollTo(0, 0);
//       }
//     }

$scope.addSpecial= function(product,qty,modnsize){

  if(parseInt(qty)>=parseInt(product.minimo_piezas)){
    $log.log("Valor ingresado: "+qty+" - Minimo requerido: "+product.minimo_piezas);
    //$scope.valor=false;

    if(typeof(qty)=="number" && qty>0){
     $log.log(product.titulo+" "+qty+"  "+modnsize.color);
     product.qty=qty;
     product.modnsize=modnsize;
     product.dispimg=product.modelos[0].imglink;
     product.imagen=product.modelos[0].imglink;
     product.color=modnsize.color;
     product.cantidad=qty;
     product.id_modelo=product.modelos[0].id_modelo;
     product.img=product.modelos[0].img;
     product.adicional=modnsize.modelo;


     $rootScope.carrito.productos=$localstorage.getObject("Carrito");
      	  		//var enCarrito;
      	  		//for (var i = 0; i <$rootScope.carrito.productos.length; i++) {
      		  	//if($rootScope.carrito.productos[i].id_producto===product.id_producto){
      		  	//		$rootScope.carrito.productos[i].qty+=qty;
      		  	//			enCarrito=true;
      		  	//	} 
      		  	//}
      		  	//if(!enCarrito){
               $rootScope.carrito.productos.push(product);
      		  	//}

              $localstorage.setObject("Carrito" ,$rootScope.carrito.productos);


       //$window.scrollTo(0, 0);

       swal({
        title: "Producto agregado",
            //text: "",
            type: "success",
            timer: 1400,
          });  


       $('.cart-preview').animate({right: "-1px"}, 600);
       setTimeout(function(){
        $('.cart-preview').animate({right: "-301px"}, 600);
      }, 3500);
     }





   }
   else{
    $log.log("El valor ingresado es: "+qty+" - Minimo requerido: "+product.minimo_piezas);

    swal({
      title: "Lo sentimos",
      text: "La cantidad minima requerida es de " + product.minimo_piezas + " piezas.",
      timer: 2400
    }
    );       

    //$scope.valor= true;
  }

}



$scope.getUnique=function (a){
 return a.sort().filter(function(item, pos, ary) {
   return !pos || item != ary[pos - 1];
 });
}



}).directive('ngConfirmClick', [
function(){
  return {
    link: function (scope, element, attr) {
      var msg = attr.ngConfirmClick || "Are you sure?";
      var clickAction = attr.confirmedClick;
      element.bind('click',function (event) {
        if ( window.confirm(msg) ) {
          scope.$eval(clickAction)
        }
      });
    }
  };
}]).controller('cart',function($scope, $rootScope, $timeout, $localstorage, $state,$log, $location){


  $rootScope.carrito.productos=$localstorage.getObject("Carrito");


		$scope.delFromCart= function(product,pos){ //Add qty if needed



      swal({
        title: '¿Desea remover este artículo?',
        text: "!Este artículo será removido del carrito!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, continuar'
      }).then((result) => {
        if (result.value) {

         $rootScope.carrito.productos=$localstorage.getObject("Carrito");
         $rootScope.carrito.productos.splice(pos, 1);  


       }
       $localstorage.setObject('Carrito', $rootScope.carrito.productos);
       //$state.go('carrito');
       $rootScope.$digest();
     } 

     );

    }
    $scope.addtoCart= function(product,qty,pos){

     if(typeof(qty)!="number"){
       swal({
        title: "Aviso",
        text: "Ingresa la cantidad de productos a añadir",
        type: "error",
      });
     }
     else{

      $scope.qty=qty;

      $rootScope.carrito.productos=$localstorage.getObject("Carrito");

      for (var i = 0; i <$rootScope.carrito.productos.length; i++) {
       if($rootScope.carrito.productos[i].id_producto===product.id_producto && i==pos){
         $rootScope.carrito.productos[i].qty+=$scope.qty;
         break;
       }

     }
     $localstorage.setObject('Carrito', $rootScope.carrito.productos);



   }

 }
 $scope.goQuot = function(){

   swal({
    title: 'Cotización',
    text: "Deseas empezar una nueva cotización",
    type: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Si, continuar'
  }).then((result) => {
    if (result.value) {

     $state.go('cotizacion');
   } 

 });
}
$scope.emptyCart=function(){

  swal({
    title: '¿Eliminar carrito?',
    text: "Los articulos seran removidos!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Si, continuar'
  }).then((result) => {
    if (result.value) {

      $rootScope.carrito={ };
      $rootScope.carrito.productos=[]; 
      $localstorage.setObject('Carrito', $rootScope.carrito.productos);
      $log.log("CARRITO VACIADO");
      $state.go('main');

    } 

  });

 // $rootScope.carrito={ };
 // $rootScope.carrito.productos=[]; 
 // $localstorage.setObject('Carrito', $rootScope.carrito.productos);
 // $log.log("CARRITO VACIADO");
 // $state.go('carrito');
}






})


.controller('quotation',function($scope,$rootScope,$log,$localstorage,$location,$state,service){


  $rootScope.carrito.productos=$localstorage.getObject("Carrito");


  $scope.cliente={};
  $scope.user={};




  $scope.guardarCliente = function ( cliente) {
   var promise = service.serverCall('cliente', 'nuevo', cliente);
   promise.then(function (res) {
    if(res.success == 1) {

     $scope.cliente.id_cliente = res.id_cliente;
     $scope.cliente.id_empresa = res.id_empresa;
     $scope.clienteGuardado=true;

     $log.log("Cliente añadido"+cliente.nombre);
       swal({
          title: "Listo, ya puedes cotizar productos",
            //text: "",
            type: "success",
            timer: 1400,
          });  
   } else {
    swal({
          title: "Por el momento no podemos realizar nuevas cotizaciones, intenta mas tarde",
            //text: "",
            type: "success",
            timer: 1400,
          });  
   }
 });
 }

 $scope.solicitarCotizacion =function (cliente) {

   var promise = service.serverCall('cliente','solicitar-cotizacion', {
    productos: $rootScope.carrito.productos,
    cliente: cliente,
    id_revendedor:9,
    comentarios: "Prueba"
  });

   promise.then(function (res) {
    if(res.success == 1) {
     $rootScope.carrito={ };
     $rootScope.carrito.productos=[]; 
     $localstorage.setObject('Carrito', $rootScope.carrito.productos);
     $log.log("CARRITO VACIADO");
   } else {
     $log.log("Error");
   }
 }).finally(function () {
  $log.log("Ejecutado");
});
}

$scope.clienteGuardado=false;

$scope.confirmarCliente=function(){

  var personafisica=0;


  if($scope.user.type=="empresa"){
    personafisica=0;
    $scope.cliente={'empresa': $scope.user.company , 'nombre':$scope.user.name,'email':$scope.user.email,'telefono':$scope.user.phone,'celular':$scope.user.cell,'persona_fisica':personafisica,'ubicacion':$scope.user.city};

  }
  else{
    personafisica=1;
    $scope.cliente={'nombre':$scope.user.name,'email':$scope.user.email,'telefono':$scope.user.phone,'celular':$scope.user.cell,'persona_fisica':personafisica,'ubicacion':$scope.user.city};

  }

  this.guardarCliente($scope.cliente);

}

$scope.checkout= function(mail){


  if(mail===""||mail===undefined){
    swal(

      'Eror!',
      'Llena la información de contacto.',
      'error'
      );
  }
  else{



    swal({
      title: 'Cotización',
      text: "Deseas enviar tú cotización a revisión",
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, continuar'
    }).then((result) => {
      if (result.value) {

        $log.log($scope.cliente);

        this.solicitarCotizacion($scope.cliente);

        $rootScope.carrito={ };
        $rootScope.carrito.productos=[]; 
        $localstorage.setObject('Carrito', $rootScope.carrito.productos);
        $state.go('main');
        $log.log("EL correo es:" +mail);


      } 

        //guardarCliente(cliente);
        //solicitarCotizacion(cliente);
        
      });


  }

			//guardarCliente(cliente);

   }



 });