import Swal from "sweetalert2";

const swalConfig = {
  customClass: {
    container: "swal-container",
  },
  buttonsStyling: true,
};

export const showSuccess = (message) => {
  return Swal.fire({
    ...swalConfig,
    icon: "success",
    title: "Success",
    text: message,
    confirmButtonText: "OK",
    timer: 2500,
    timerProgressBar: true,
  });
};

export const showError = (message) => {
  return Swal.fire({
    ...swalConfig,
    icon: "error",
    title: "Failed",
    text: message,
    confirmButtonText: "OK",
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showWarning = (message) => {
  return Swal.fire({
    ...swalConfig,
    icon: "warning",
    title: "Warning",
    text: message,
    confirmButtonText: "OK",
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showInfo = (message) => {
  return Swal.fire({
    ...swalConfig,
    icon: "info",
    title: "Information",
    text: message,
    confirmButtonText: "OK",
    timer: 2500,
    timerProgressBar: true,
  });
};

export const showConfirm = (message) => {
  return Swal.fire({
    ...swalConfig,
    icon: "warning",
    title: "Confirm",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  });
};
