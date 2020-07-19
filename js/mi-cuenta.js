$(document).ready(function () {
    const correo= localStorage.getItem("correo");
    const estado = localStorage.getItem("estado");
    const rol = localStorage.getItem("rol");

    $("#input-correo").val(correo);
    $("#input-rol").val(rol);
    $("#input-estado").val(estado);
});