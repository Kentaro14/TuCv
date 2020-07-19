$(document).ready(function () {
    if(localStorage.getItem("usuario")){
        window.location.href = "cv.html";
    }
});

$("#iniciar").on('click', function (e) {
    e.preventDefault();
    const correo = $("#input-correo").val().trim();
    const contrasena = $("#input-contrasena").val();
    validarUsuario(correo, contrasena);
});

function validarUsuario(correo, contrasena) {
    axios.get("https://tu-cv-api.herokuapp.com/usuarios")
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                const usuario = data.find(usuario => usuario.correo == correo.toLowerCase());
                if (usuario) {
                    if (usuario.contrasena === contrasena) {
                        if (usuario.estado === "Inactivo") {
                            msjErrorEstado.fire();
                        } else {
                            localStorage.setItem("usuario", usuario.id);
                            localStorage.setItem("correo", usuario.correo);
                            localStorage.setItem("estado", usuario.estado);
                            localStorage.setItem("rol", usuario.rol);
                            window.location.href = "cv.html";
                        }
                    } else {
                        msjErrorContrasena.fire();
                    }
                } else {
                    msjErrorCorreo.fire();
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

//----------------- MENSAJE DE ERROR ------------------//

const msjErrorCorreo = Swal.mixin({
    title: 'Usuario No Existe!',
    text: 'Porfavor intentar denuevo.',
    icon: 'warning',
    confirmButtonText: 'Ok'
});

const msjErrorContrasena = Swal.mixin({
    title: 'Contraseña Incorrecta!',
    text: 'Porfavor intentar denuevo.',
    icon: 'warning',
    confirmButtonText: 'Ok'
});

const msjErrorEstado = Swal.mixin({
    title: 'Usuario Inactivo!',
    text: 'Su cuenta se encuentra Inactiva.',
    icon: 'error',
    confirmButtonText: 'Ok'
});