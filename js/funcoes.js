function validarCampos(matricula, senha) {
  if (matricula === "" && senha === "") {
    return "Informe a matrícula e a senha.";
  }
  if (matricula === "") {
    return "Informe a matrícula.";
  }
  if (senha === "") {
    return "Informe a senha.";
  }
  return "";
}

// autenticar() agora fica em js/dados.js, junto com os outros dados mocados
