var estados = {
    agregar: {
        tipo: false,
        entidad: false,
        detalle: false,
        fin: false
    },
    actualizar: {
        tipo: true,
        entidad: true,
        detalle: true,
        fin: true
    }
}

let formaciones;

let entidades;

const userId=localStorage.getItem("usuario");

//---------------- Conexion al Backend -----------------//

$(document).ready(function () {
    getEntidades();
});

function getFormacion() {
    axios.get('https://tu-cv-api.herokuapp.com/formacion', {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                formaciones = data;
                cargarTabla(formaciones);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function postFormacion(data) {
    axios.post('https://tu-cv-api.herokuapp.com/formacion', data, {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            if (res.status == 201) {
                window.location.reload(true);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function putFormacion(id, data) {
    axios.put(`https://tu-cv-api.herokuapp.com/formacion/${id}`, data, {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            if (res.status == 201) {
                window.location.reload(true);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function deleteFormacion(id, faltaEntidad = false) {
    axios.delete(`https://tu-cv-api.herokuapp.com/formacion/${id}`, {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            if (res.status == 200) {
                if (!faltaEntidad) window.location.reload(true);
                console.log("Formacion eliminada");
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function getEntidades() {
    axios.get("https://tu-cv-api.herokuapp.com/entidades", {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                entidades = data.sort(comparar);
                cargarSelect();
                getFormacion();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getEntidad(id) {
    return entidades.find(entidad => entidad.id == id);
}

function cargarTabla(data) {
    let count = 0;
    $("tbody").children("tr").remove();
    data.forEach(formacion => {
        if (getEntidad(formacion.entidad) == undefined) {
            deleteFormacion(formacion.id, true);
            return;
        }
        count++;
        const id = formacion.id;
        const tipo = formacion.tipo;
        const entidad = getEntidad(formacion.entidad).nombre;
        const fin = obtenerFecha(formacion.fin);

        const fila = `
        <tr data-id="${id}">
            <th id="count" scope="row">${count}</th>
            <td>${tipo}</td>
            <td>${entidad}</td>
            <td style="text-align: center;">${fin}</td>
            <td style="text-align: center;"><button type="button" class="edit-button"><i class="far fa-edit"></i></button> | <button class="delete-button"><i class="fas fa-trash"></i></button>
        </tr>
        `
        $("tbody").append(fila);
    });

    $(".edit-button").on('click', function () {
        const formacionId = $(this).closest("tr")[0].dataset.id;
        const formacion = formaciones.find(forma => forma.id == formacionId);
        $("#select-tipo-actualizar").val(formacion.tipo);
        $("#select-entidad-actualizar").val(formacion.entidad);
        $("#input-detalle-actualizar").val(formacion.detalle);
        $("#input-fecha-fin-actualizar").val(formatearFecha(formacion.fin));
        $("#check-visible-actualizar").prop("checked", formacion.visible);
        $("#btn-actualizar").data("id", formacionId);
        $("#actualizar-modal").modal('show');
    });

    $(".delete-button").on('click', function () {
        const formacionId = $(this).closest("tr")[0].dataset.id;
        deleteFormacion(formacionId);
    });
}

$("#btn-agregar").on('click',function(e){
    e.preventDefault();
    const data ={
        tipo: $("#select-tipo").val(),
        entidad: $("#select-entidad").val(),
        detalle: $("#input-detalle").val(),
        fin: convertirFecha($("#input-fecha-fin").val()),
        visible: $("#check-visible").is(":checked")
    }
    postFormacion(data);
});

$("#btn-actualizar").on('click',function(e){
    e.preventDefault();
    const idFormacion = $(this).data("id");
    const data ={
        tipo: $("#select-tipo-actualizar").val(),
        entidad: $("#select-entidad-actualizar").val(),
        detalle: $("#input-detalle-actualizar").val(),
        fin: convertirFecha($("#input-fecha-fin-actualizar").val()),
        visible: $("#check-visible-actualizar").is(":checked")
    }
    putFormacion(idFormacion,data);
});

function cargarSelect() {
    entidades.forEach(entidad => {
        $("#select-entidad, #select-entidad-actualizar").append(`<option value=${entidad.id}>${entidad.nombre}</option>`)
    })
}

function obtenerFecha(fecha) {
    return new Date(fecha).getFullYear();
}

//---------------- Validacion ---------------------//

$(".select-formacion").on('change', function () {
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

$(".select-formacion").on('blur', function () {
    if (this.value == "Seleccione Tipo..." || this.value == "Seleccione Entidad...") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }
});



$(".input-formacion").on('blur', function () {
    const modal = this.dataset.modal;
    const campo = this.dataset.campo;
    if (this.value == "") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid")
        estados[modal][campo] = false;
    } else {
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid");
        estados[modal][campo] = true;
    }

    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$('.datepicker').datepicker().on('changeDate', function (e) {
    const elemento = $(this).children('.input-formacion')[0];
    const modal = elemento.dataset.modal;
    $(elemento).removeClass("is-invalid");
    $(elemento).addClass("is-valid")
    estados[modal].fin = true;

    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$("textarea").on('keyup', function () {
    if (this.value.length == 250) {
        $(".limite").removeAttr("hidden");
    } else {
        $(".limite").attr("hidden", true);
    }
});

function validarTodo(modal) {
    const valores = Object.values(estados[modal]);
    for (valor of valores) {
        if (!valor) return false;
    }
    return true;
}

//----------------- Filtrar Tabla -------------------//

$("input[type='radio']").on('click',function(){
    const tipo = $("input[name='tipo']:checked").val();
    if(tipo=="Curso" || tipo=="Estudio"){
        filtrarTabla(tipo);
    }else{
        cargarTabla(formaciones);
    }
})

function filtrarTabla(tipo){
    const formacionesFiltradas = formaciones.filter(formacion=>formacion.tipo==tipo);
    cargarTabla(formacionesFiltradas);
}

//----------------- Ordenar Lista -------------------//

function comparar(a, b) {
    if (a.nombre < b.nombre) {
        return -1;
    }
    if (a.nombre > b.nombre) {
        return 1;
    }
    return 0;
}

//---------------- Manejar Fechas------------------//

function convertirFecha(fecha){
    var dateString = fecha;

    var dateParts = dateString.split("/");

    // month is 0-based, that's why we need dataParts[1] - 1
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
}

function formatearFecha(fecha){
    const current_datetime = new Date(fecha);
    const dia=current_datetime.getDate()<10?"0"+current_datetime.getDate():current_datetime.getDate();
    const mes=(current_datetime.getMonth() + 1)<10?"0"+(current_datetime.getMonth() + 1):(current_datetime.getMonth() + 1);
    return dia + "/" + mes + "/" + current_datetime.getFullYear();
}

$("#formulario-agregar").on('reset', function () {
    for (campo of Object.keys(estados.agregar)) {
        estados.agregar[campo] = false;
    }
    $(".limite").attr("hidden", true);
    $(`#btn-agregar`).attr("disabled", true);
});
