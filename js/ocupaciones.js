var estados = {
    agregar: {
        entidad: false,
        nombre: false,
        detalle: false,
        inicio: false,
        fin: false
    },
    actualizar: {
        entidad: true,
        nombre: true,
        detalle: true,
        inicio: true,
        fin: true
    }
}

let ocupaciones;

let entidades;

const userId = localStorage.getItem("usuario");

//------------------ Conexion a Backend ---------------//

$(document).ready(function () {
    getEntidades();
});

function getOcupaciones() {
    axios.get('https://tu-cv-api.herokuapp.com/ocupaciones', {
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
                ocupaciones = data.sort(compararOcupacion);
                cargarTabla();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function postOcupacion(data) {
    axios.post('https://tu-cv-api.herokuapp.com/ocupaciones', data, {
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

function putOcupacion(id, data) {
    axios.put(`https://tu-cv-api.herokuapp.com/ocupaciones/${id}`, data, {
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

function deleteOcupacion(id, faltaEntidad = false) {
    axios.delete(`https://tu-cv-api.herokuapp.com/ocupaciones/${id}`, {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            if (res.status == 200) {
                if (!faltaEntidad) window.location.reload(true);
                console.log("Ocupacion eliminada");
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
                entidades = data.sort(compararEntidad);
                cargarSelect();
                getOcupaciones();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getEntidad(id) {
    return entidades.find(ent => ent.id == id);
}

function cargarTabla() {
    let count = 0;
    $("tbody").children("tr").remove();
    ocupaciones.forEach(ocupacion => {
        if (getEntidad(ocupacion.entidad) == undefined) {
            deleteOcupacion(ocupacion.id, true);
            return;
        }
        count++;
        const id = ocupacion.id;
        const entidad = getEntidad(ocupacion.entidad).nombre;
        const nombre = ocupacion.nombre;
        const inicio = new Date(ocupacion.inicio).getFullYear();
        const fin = new Date(ocupacion.fin).getFullYear();
        const fila = `
        <tr data-id="${id}">
        <th scope="row">${count}</th>
        <td>${entidad}</td>
        <td>${nombre}</td>
        <td style="text-align: center;" >${inicio}</td>
        <td style="text-align: center;" >${fin}</td>
        <td style="text-align: center;"><button type="button" class="edit-button"><i class="far fa-edit"></i></button> | <button class="delete-button"><i class="fas fa-trash"></i></button>
        </tr>
        `
        $("tbody").append(fila);
    });

    $(".edit-button").on('click', function () {
        const ocupacionId = $(this).closest("tr")[0].dataset.id;
        const ocupacion = ocupaciones.find(ocup => ocup.id == ocupacionId);
        $("#select-entidad-actualizar").val(ocupacion.entidad);
        $("#input-nombre-actualizar").val(ocupacion.nombre);
        $("#input-detalle-actualizar").val(ocupacion.detalle);
        $("#input-fecha-inicio-actualizar").val(formatearFecha(ocupacion.inicio));
        $("#input-fecha-fin-actualizar").val(formatearFecha(ocupacion.fin));
        $("#btn-actualizar").data("id", ocupacionId);
        $("#actualizar-modal").modal('show');
    });

    $(".delete-button").on('click', function () {
        const ocupacionId = $(this).closest("tr")[0].dataset.id;
        deleteOcupacion(ocupacionId);
    });
}

function cargarSelect() {
    entidades.forEach(entidad => {
        $(".select-ocupaciones").append(`<option value=${entidad.id}>${entidad.nombre}</option>`)
    })
}

$("#btn-agregar").on('click', function (e) {
    e.preventDefault();
    const data = {
        entidad: $("#select-entidad").val(),
        nombre: $("#input-nombre").val().trim(),
        detalle: $("#input-detalle").val(),
        inicio: convertirFecha($("#input-fecha-inicio").val()),
        fin: convertirFecha($("#input-fecha-fin").val())
    }
    postOcupacion(data);
});

$("#btn-actualizar").on('click', function (e) {
    e.preventDefault();
    const idOcupacion = $(this).data("id");
    const data = {
        entidad: $("#select-entidad-actualizar").val(),
        nombre: $("#input-nombre-actualizar").val().trim(),
        detalle: $("#input-detalle-actualizar").val(),
        inicio: convertirFecha($("#input-fecha-inicio-actualizar").val()),
        fin: convertirFecha($("#input-fecha-fin-actualizar").val())
    }

    putOcupacion(idOcupacion, data);

});


//------------------- Validaciones -------------------//

$(".select-ocupaciones").on('change', function () {
    const modal = this.dataset.modal;
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
    estados[modal].entidad = true;
    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$(".select-ocupaciones").on('blur', function () {
    if (this.value == "Seleccione Tipo..." || this.value == "Seleccione Entidad...") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }
});

$(".input-ocupaciones").on('blur', function () {
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
    const elemento = $(this).children('.input-ocupaciones')[0];
    const modal = elemento.dataset.modal;
    const campo = elemento.dataset.campo;
    $(elemento).removeClass("is-invalid");
    $(elemento).addClass("is-valid")
    estados[modal][campo] = true;

    if ($(this).hasClass("datepicker-inicio")) {
        const elementoFechaFin = $(this).closest(".form-row").find(".datepicker-fin").children(".input-ocupaciones")[0];
        $(".datepicker-fin").datepicker('clearDates');
        $(".datepicker-fin").datepicker('setStartDate', convertirFecha(elemento.value));
        $(elementoFechaFin).removeClass("is-invalid");
        $(elementoFechaFin).removeClass("is-valid");
        estados[modal].fin = false;
    }

    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$(".datepicker-inicio").datepicker('setEndDate', new Date());
$(".datepicker-fin").datepicker('setStartDate', new Date());

$("input").on('keyup', function () {
    if (this.value.length == 250) {
        $(".limite").removeAttr("hidden");
    } else {
        $(".limite").attr("hidden", true);
    }
});

$("textarea").on('keyup', function () {
    var words = 0;
    if (this.value !== "") {
        var words = this.value.match(/\S+/g).length;
    }
    if (words > 30) {
        // Split the string on first 30 words and rejoin on spaces
        var trimmed = $(this).val().split(/\s+/, 30).join(" ");
        // Add a space at the end to keep new typing making new words
        $(this).val(trimmed + " ");
    } else {
        $(`#restantes-${this.dataset.modal}`).text(30 - words);
    }
});


function validarTodo(modal) {
    const valores = Object.values(estados[modal]);
    for (valor of valores) {
        if (!valor) return false;
    }
    return true;
}

//---------------- Manejar Fechas------------------//


function convertirFecha(fecha) {
    var dateString = fecha;

    var dateParts = dateString.split("/");

    // month is 0-based, that's why we need dataParts[1] - 1
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

function formatearFecha(fecha) {
    const current_datetime = new Date(fecha);
    const dia = current_datetime.getDate() < 10 ? "0" + current_datetime.getDate() : current_datetime.getDate();
    const mes = (current_datetime.getMonth() + 1) < 10 ? "0" + (current_datetime.getMonth() + 1) : (current_datetime.getMonth() + 1);
    return dia + "/" + mes + "/" + current_datetime.getFullYear();
}

//----------------- Ordenar Lista -------------------//

function compararEntidad(a, b) {
    if (a.nombre < b.nombre) {
        return -1;
    }
    if (a.nombre > b.nombre) {
        return 1;
    }
    return 0;
}

function compararOcupacion(a, b) {
    if (a.entidad < b.entidad) {
        return -1;
    }
    if (a.entidad > b.entidad) {
        return 1;
    }
    return 0;
}

$("#formulario-agregar").on('reset', function () {
    for (campo of Object.keys(estados.agregar)) {
        estados.agregar[campo] = false;
    }
    $(".limite").attr("hidden", true);
    $(`#restantes-agregar`).text(20);
    $(`#btn-agregar`).attr("disabled", true);
});