    // INITIALIZE DATE PICK BOOT
    if($('.datepicker').length){
        $('.datepicker').datepicker({
            language: "es",
            format: "dd/mm/yyyy",
            autoclose: true,
            endDate: new Date(new Date().getFullYear(), 11, 31)
        });
    }

    $('#agregar-modal').on('hidden.bs.modal', function (e) {
        $('#formulario-agregar')[0].reset();
        $('.is-valid').removeClass('is-valid');
        $('.is-invalid').removeClass('is-invalid');
    });

    $('#actualizar-modal').on('hidden.bs.modal', function (e) {
        $('#formulario-actualizar')[0].reset();
        $('.is-valid').removeClass('is-valid');
        $('.is-invalid').removeClass('is-invalid');
    });

    $(document).ready(function () {
    const pathname=window.location.pathname;
    let pagina=pathname.split("/")
    pagina=pagina[pagina.length-1];
    validarSesion(pagina);
    });

    //--------- validar que usuario inicio sesion ---------//



    function validarSesion(pagina){
        const usuario = localStorage.getItem("usuario");
        const estado = localStorage.getItem("estado");
        const rol = localStorage.getItem("rol");
        
        if(usuario!=null){
            if(estado==="Inactivo"&&pagina!="mi-cuenta.html") window.location.href='mi-cuenta.html';
            if(rol==="Administrador") $("#nav-usuarios").removeAttr('hidden');
        }else{
            window.location.href='index.html';
        }
    }

    //----------- Cerrar Sesion ----------------//

    $("#logout").on('click',function(e){
        e.preventDefault();
        localStorage.removeItem("usuario");
        localStorage.removeItem("correo");
        localStorage.removeItem("rol");
        localStorage.removeItem("estado");
        window.location.href='index.html';
    })