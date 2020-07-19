var estados ={
    agregar:{
        correo:false,
        contrasena:false,
        rol:false,
        estado:false
    },
    actualizar:{
        correo:true,
        contrasena:true,
        rol:true,
        estado:true
    }
}

let usuarios;

const userId=localStorage.getItem("usuario");

//------------------ Conexion a Backend ------------//

$(document).ready(function () {
    getUsuarios();
});

function getUsuarios(){
    axios.get("https://tu-cv-api.herokuapp.com/usuarios")
    .then(function (res){
        const {data,status} = res;
        if(status==200){
            usuarios=data;
            usuarios=usuarios.filter(usuario=>usuario.id!=userId);
            cargarTabla(usuarios);
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function postUsuario(data){
    axios.post("https://tu-cv-api.herokuapp.com/usuarios",data)
    .then(function (res){
        const {status} = res;
        if(status==201){
            window.location.reload();
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function putUsuario(id,data){
    axios.put(`https://tu-cv-api.herokuapp.com/usuarios/${id}`,data)
    .then(function (res){
        const {status} = res;
        if(status==201){
            window.location.reload();
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function deleteUsuario(id){
    axios.delete(`https://tu-cv-api.herokuapp.com/usuarios/${id}`)
    .then(function (res){
        const {status} = res;
        if(status==200){
            window.location.reload();
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function cargarTabla(data){
    let count=0;
    $("tbody").children("tr").remove();
    data.forEach(usuario => {
        count++;
        const id=usuario.id;
        const correo=usuario.correo;
        const rol=usuario.rol;
        const estado=usuario.estado;
        const fila =`
        <tr data-id="${id}">
            <th scope="row">${count}</th>
            <td>${correo}</td>
            <td>${rol}</td>
            <td>${estado}</td>
            <td style="text-align: center;"><button type="button" class="edit-button"><i class="far fa-edit"></i></button> | <button class="delete-button"><i class="fas fa-trash"></i></button>
        </tr>
        `
        $("tbody").append(fila);
   });

   $("#cantidad-usuarios").text(count);

   $(".edit-button").on('click',function (){
        const usuarioId =$(this).closest("tr")[0].dataset.id;
        const usuario=usuarios.find(usuario=>usuario.id==usuarioId);
        $("#input-correo-actualizar").val(usuario.correo);
        $("#input-contrasena-actualizar").val(usuario.contrasena);
        $("#select-rol-actualizar").val(usuario.rol);
        $("#select-estado-actualizar").val(usuario.estado);
        $("#btn-actualizar").data("id",usuarioId);
        $("#actualizar-modal").modal('show');
    });

    $(".delete-button").on('click',function (){
        const usuarioId =$(this).closest("tr")[0].dataset.id;
        deleteUsuario(usuarioId);
    });
}

$("#btn-agregar").on('click',function(e){
    e.preventDefault();
    const data ={
        correo: $("#input-correo").val().trim(),
        contrasena: $("#input-contrasena").val(),
        rol: $("#select-rol").val(),
        estado: $("#select-estado").val()
    }

    if(validarDuplicidad(data.correo)){
        msjError.fire();
        $("#input-correo").removeClass("is-valid");
        $("#input-correo").addClass("is-invalid");
        estados.agregar.correo=false;
        $(`#btn-agregar`).attr("disabled",true);
    }else{
        postUsuario(data);
    }
});

$("#btn-actualizar").on('click',function(e){
    e.preventDefault();
    const idUsuario=$(this).data("id");
    const data ={
        correo: $("#input-correo-actualizar").val().trim(),
        contrasena: $("#input-contrasena-actualizar").val(),
        rol: $("#select-rol-actualizar").val(),
        estado: $("#select-estado-actualizar").val()
    }

    if(validarDuplicidad(data.correo,idUsuario)){
        msjError.fire();
        $("#input-correo-actualizar").removeClass("is-valid");
        $("#input-correo-actualizar").addClass("is-invalid");
        estados.agregar.correo=false;
        $(`#btn-actualizar`).attr("disabled",true);
    }else{
        putUsuario(idUsuario,data);
    }
});


//------------------ Validaciones ---------------//

$(".input-usuarios").on('blur',function (){
    const modal = this.dataset.modal; 
    const campo =this.dataset.campo;
    const valor= this.value;
    
    if(validar(valor,modal,campo)){
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid")
    }else{
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }

    if(validarTodo(modal)){
        $(`#btn-${modal}`).removeAttr("disabled");
    }else{
        $(`#btn-${modal}`).attr("disabled",true);
    }
});

$(".select-usuarios").on('change', function () {
    const modal = this.dataset.modal;
    const campo = this.dataset.campo;
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
    estados[modal][campo] = true;
    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$(".select-usuarios").on('blur', function () {
    if (this.value == "Seleccione Rol..." || this.value == "Seleccione Estado...") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }
});

function validarTodo(modal){
    const valores=Object.values(estados[modal]);
    for(valor of valores){
        if(!valor) return false;
    }
    return true;
}

function validarDuplicidad(correo,id="0"){
    const usuariosEncontradas = usuarios.filter(usuario=>usuario.correo.toLowerCase()==correo.toLowerCase());
    if(id==="0"){
        if(usuariosEncontradas.length>0) return true;
    }else{
        if(usuariosEncontradas>0&&usuariosEncontradas[0]['id']!=id) return true;
    }
    
    return false;
}

function validar(valor,modal,campo){
    switch (campo) {
        case "correo":
            var emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(emailRex.test(valor)){
                estados[modal][campo]=true;
                return true;
            }else{
                estados[modal][campo]=false;
                return false;
            }

        case "contrasena":
            if(/^[\S]{4,8}$/i.test(valor)){
                estados[modal][campo]=true;
                return true;
            }else{
                estados[modal][campo]=false;
                return false;
            }
        default:
            break;
    }
}

//----------------- Filtrar Tabla -------------------//

$("input[type='radio']").on('click',function(){
    const estado = $("input[name='estado']:checked").val();
    if(estado=="Activo" || estado=="Inactivo"){
        filtrarTabla(estado);
    }else{
        cargarTabla(usuarios);
    }
})

function filtrarTabla(estado){
    const usuariosFiltrados = usuarios.filter(usuario=>usuario.estado==estado);
    cargarTabla(usuariosFiltrados);
}

//----------------- MENSAJE DE ERROR ------------------//

const msjError = Swal.mixin({
    title: 'Usuario Ya Esta Registrada!',
    text: 'Porfavor verificar datos.',
    icon: 'warning',
    confirmButtonText: 'Ok'
});

$('#agregar-modal').on('hidden.bs.modal', function (e) {
    $(`#btn-agregar`).attr("disabled", true);
});
