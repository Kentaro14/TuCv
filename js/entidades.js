var estados={
    agregar:{
        nombre:false,
        descripcion: false
    },
    actualizar:{
        nombre:true,
        descripcion: true
    }
}


let entidades;

const userId=localStorage.getItem("usuario");

//----------- Conexion a Backend ----------------//

$(document).ready(function () {
    getEntidades();
});

function getEntidades(){
    axios.get("https://tu-cv-api.herokuapp.com/entidades",{headers:{usuario:userId}})
    .then(function (res){
        const {data,status} = res;
        if(status==200){
            entidades=data.sort(comparar);
            cargarTabla();
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function postEntidad(data){
    axios.post("https://tu-cv-api.herokuapp.com/entidades",data,{headers:{usuario:userId}})
    .then(function (res){
        const {status} = res;
        if(status==201){
            window.location.reload(true);
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function putEntidad(id,data){
    axios.put(`https://tu-cv-api.herokuapp.com/entidades/${id}`,data,{headers:{usuario:userId}})
    .then(function (res){
        const {status} = res;
        if(status==201){
            window.location.reload(true);
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function deleteEntidad(id){
    axios.delete(`https://tu-cv-api.herokuapp.com/entidades/${id}`,{headers:{usuario:userId}})
    .then(function (res){
        const {status} = res;
        if(status==200){
            window.location.reload(true);
        }
    })
    .catch(function (error){
        console.log(error);
    });
}


    
function cargarTabla(){
    let count=0;
    $("tbody").children("tr").remove();
    entidades.forEach(entidad => {
        count++;
        const nombre=entidad.nombre;
        const descripcion=entidad.descripcion;
        const id=entidad.id;
        const fila =`
        <tr data-id="${id}">
            <th scope="row">${count}</th>
            <td>${nombre}</td>
            <td>${descripcion}</td>
            <td style="text-align: center;"><button type="button" class="edit-button"><i class="far fa-edit"></i></button> | <button class="delete-button"><i class="fas fa-trash"></i></button>
        </tr>
        `
        $("tbody").append(fila);
   });

   $(".edit-button").on('click',function (){
        const entidadId =$(this).closest("tr")[0].dataset.id;
        const entidad=entidades.find(ent=>ent.id==entidadId);
        $("#input-nombre-actualizar").val(entidad.nombre);
        $("#input-descripcion-actualizar").val(entidad.descripcion);
        $("#btn-actualizar").data("id",entidadId);
        $("#actualizar-modal").modal('show');
    });

    $(".delete-button").on('click',function (){
        const entidadId =$(this).closest("tr")[0].dataset.id;
        deleteEntidad(entidadId);
    });
}

$("#btn-agregar").on('click',function(e){
    e.preventDefault();
    const data ={
        nombre: $("#input-nombre").val().trim(),
        descripcion: $("#input-descripcion").val().trim(),
    }

    if(validarDuplicidad(data.nombre)){
        msjError.fire();
        $("#input-nombre").removeClass("is-valid");
        $("#input-nombre").addClass("is-invalid");
        estados.agregar.nombre=false;
        $(`#btn-agregar`).attr("disabled",true);
    }else{
        postEntidad(data);
    }
});

$("#btn-actualizar").on('click',function(e){
    e.preventDefault();
    const idEntidad=$(this).data("id");
    const data ={
        nombre: $("#input-nombre-actualizar").val().trim(),
        descripcion: $("#input-descripcion-actualizar").val().trim(),
    }
    if(validarDuplicidad(data.nombre,idEntidad)){
        msjError.fire();
        $("#input-nombre-actualizar").removeClass("is-valid");
        $("#input-nombre-actualizar").addClass("is-invalid");
        estados.actualizar.nombre=false;
        $(`#btn-actualizar`).attr("disabled",true);
    }else{
        putEntidad(idEntidad,data);
    }

});

//----------- VALIDACIONES -------------//


$(".input-entidades").on('blur',function (){
    const modal = this.dataset.modal; 
    const campo =this.dataset.campo;
    
    if(this.value==""){
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
        estados[modal][campo]=false;
    }else{
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid")
        estados[modal][campo]=true;
    }

    if(validarTodo(modal)){
        $(`#btn-${modal}`).removeAttr("disabled");
    }else{
        $(`#btn-${modal}`).attr("disabled",true);
    }
});

$("input").on('keyup',function(){
    if(this.value.length==250){
        $(".limite").removeAttr("hidden");
    }else{
        $(".limite").attr("hidden",true);
    }
});



$("textarea").on('keyup', function() {
    var words = 0;
    if(this.value!==""){
    var words = this.value.match(/\S+/g).length;
    }
    if (words > 20) {
        // Split the string on first 30 words and rejoin on spaces
        var trimmed = $(this).val().split(/\s+/, 20).join(" ");
        // Add a space at the end to keep new typing making new words
        $(this).val(trimmed + " ");
    }else {
        $(`#restantes-${this.dataset.modal}`).text(20-words);            
    }
});

function validarDuplicidad(nombre,id="0"){
    const entidadesEncontradas = entidades.filter(entidad=>entidad.nombre.toLowerCase()==nombre.toLowerCase());
    if(id==="0"){
        if(entidadesEncontradas.length>0) return true;
    }else{
        if(entidadesEncontradas>0&&entidadesEncontradas[0]['id']!=id) return true;
    }
    
    return false;
}


function validarTodo(modal){
    const valores=Object.values(estados[modal]);
    for(valor of valores){
        if(!valor) return false;
    }
    return true;
}


//----------------- MENSAJE DE ERROR ------------------//

const msjError = Swal.mixin({
    title: 'Entidad Ya Esta Registrada!',
    text: 'Porfavor verificar datos.',
    icon: 'warning',
    confirmButtonText: 'Ok'
});

//----------------- Ordenar Lista -------------------//

function comparar(a,b){
    if ( a.nombre < b.nombre ){
        return -1;
      }
      if ( a.nombre > b.nombre ){
        return 1;
      }
      return 0;
}

$("#formulario-agregar").on('reset',function(){
    for(campo of Object.keys(estados.agregar)){
        estados.agregar[campo]=false;
    }
    $(".limite").attr("hidden",true);
    $(`#restantes-agregar`).text(20);
    $(`#btn-agregar`).attr("disabled",true);
});