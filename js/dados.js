// "Banco" de mentira: os dados ficam salvos no navegador (localStorage), na chave "banco".
// Para voltar aos dados iniciais: localStorage.removeItem('banco') no console.

// Data de hoje no formato 2026-11-04
function hoje() {
  let data = new Date();
  let mes = data.getMonth() + 1; // janeiro é 0
  let dia = data.getDate();
  if (mes < 10) mes = '0' + mes;
  if (dia < 10) dia = '0' + dia;
  return data.getFullYear() + '-' + mes + '-' + dia;
}

// Hora de agora no formato 11:45
function agora() {
  let data = new Date();
  let hora = data.getHours();
  let minuto = data.getMinutes();
  if (hora < 10) hora = '0' + hora;
  if (minuto < 10) minuto = '0' + minuto;
  return hora + ':' + minuto;
}

let DADOS_INICIAIS = {
  // shortcut: senha em texto puro porque não há servidor para guardar hash; nunca faça isso num sistema real
  usuarios: [
    { id: 1, matricula: '1001', nome: 'Ana Souza',    senha: 'cantina123', perfil: 'atendente',  ativo: 1 },
    { id: 2, matricula: '1002', nome: 'Bruno Lima',   senha: 'lanche2026', perfil: 'atendente',  ativo: 1 },
    { id: 3, matricula: '2001', nome: 'Carla Mendes', senha: 'super2026',  perfil: 'supervisor', ativo: 1 },
    { id: 4, matricula: '2002', nome: 'Diego Rocha',  senha: 'diego2026',  perfil: 'atendente',  ativo: 0 }
  ],
  turmas: [
    { id: 1, nome: 'Técnico em Desenvolvimento de Sistemas' },
    { id: 2, nome: 'Técnico em Mecânica' }
  ],
  alunos: [
    { id: 1, matricula: 'A001', nome: 'João Pereira',  turma_id: 1, ativo: 1 },
    { id: 2, matricula: 'A002', nome: 'Maria Schmitt', turma_id: 2, ativo: 1 }
  ],
  // João já retirou hoje, para testar o bloqueio da segunda retirada
  entregas: [
    { id: 1, aluno_id: 1, usuario_id: 1, data: hoje(), hora: '11:45' }
  ]
};

// ---------- funções de ajuda ----------

function lerBanco() {
  // Na primeira vez ainda não tem nada salvo: grava os dados iniciais
  if (localStorage.getItem('banco') === null) {
    gravarBanco(DADOS_INICIAIS);
  }
  return JSON.parse(localStorage.getItem('banco'));
}

function gravarBanco(banco) {
  localStorage.setItem('banco', JSON.stringify(banco));
}

// Procura na lista o item com esse id. Se não achar, devolve null.
// Usa == porque o id que vem do formulário é texto ("1") e o salvo é número (1)
function buscarPorId(lista, id) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id == id) return lista[i];
  }
  return null;
}

// Tira da lista o item com esse id
function removerPorId(lista, id) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id == id) {
      lista.splice(i, 1);
      return;
    }
  }
}

// Maior id da lista + 1
function proximoId(lista) {
  let maior = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id > maior) maior = lista[i].id;
  }
  return maior + 1;
}

// ---------- login ----------

function exigirLogin() {
  if (localStorage.getItem('perfil') === null) {
    alert('Faça login para continuar.');
    location.href = 'index.html';
  }
}

function exigirSupervisor() {
  if (localStorage.getItem('perfil') !== 'supervisor') {
    alert('Faça login como supervisor.');
    location.href = 'index.html';
  }
}

function autenticar(matricula, senha) {
  let usuarios = lerBanco().usuarios;
  for (let i = 0; i < usuarios.length; i++) {
    let usuario = usuarios[i];
    if (usuario.matricula === matricula && usuario.senha === senha && usuario.ativo == 1) {
      localStorage.setItem('id', usuario.id);
      localStorage.setItem('nome', usuario.nome);
      localStorage.setItem('matricula', usuario.matricula);
      localStorage.setItem('perfil', usuario.perfil);
      return { aceito: true, mensagem: 'Bem-vindo(a), ' + usuario.nome + '!', usuario: { nome: usuario.nome, perfil: usuario.perfil } };
    }
  }
  return { aceito: false, mensagem: 'Matrícula ou senha incorreta.', usuario: null };
}

// ---------- turmas ----------

function listarTurmas() {
  let banco = lerBanco();
  for (let i = 0; i < banco.turmas.length; i++) {
    let turma = banco.turmas[i];
    // conta quantos alunos são dessa turma
    turma.alunos = 0;
    for (let j = 0; j < banco.alunos.length; j++) {
      if (banco.alunos[j].turma_id == turma.id) turma.alunos++;
    }
  }
  return banco.turmas;
}

function salvarTurma(dados) {
  let banco = lerBanco();
  let nome = dados.nome.trim();
  if (nome === '') return { erro: 'Informe o nome da turma.' };

  for (let i = 0; i < banco.turmas.length; i++) {
    if (banco.turmas[i].nome === nome && banco.turmas[i].id != dados.id) {
      return { erro: 'Já existe uma turma com esse nome.' };
    }
  }

  if (dados.acao === 'inserir') {
    banco.turmas.push({ id: proximoId(banco.turmas), nome: nome });
  } else {
    buscarPorId(banco.turmas, dados.id).nome = nome;
  }
  gravarBanco(banco);
  return { ok: true };
}

function excluirTurma(id) {
  let banco = lerBanco();
  for (let i = 0; i < banco.alunos.length; i++) {
    if (banco.alunos[i].turma_id == id) {
      return { erro: 'A turma tem alunos. Mude os alunos de turma antes de excluir.' };
    }
  }
  removerPorId(banco.turmas, id);
  gravarBanco(banco);
  return { ok: true };
}

// ---------- alunos ----------

function listarAlunos() {
  let banco = lerBanco();
  for (let i = 0; i < banco.alunos.length; i++) {
    let aluno = banco.alunos[i];
    aluno.turma = buscarPorId(banco.turmas, aluno.turma_id).nome; // nome da turma para a tabela
  }
  return banco.alunos;
}

function salvarAluno(dados) {
  let banco = lerBanco();
  let matricula = dados.matricula.trim();
  let nome = dados.nome.trim();
  let turmaId = Number(dados.turma_id);
  let ativo = Number(dados.ativo);

  if (matricula === '' || nome === '' || buscarPorId(banco.turmas, turmaId) === null) {
    return { erro: 'Preencha matrícula, nome e turma.' };
  }
  for (let i = 0; i < banco.alunos.length; i++) {
    if (banco.alunos[i].matricula === matricula && banco.alunos[i].id != dados.id) {
      return { erro: 'Matrícula já cadastrada.' };
    }
  }

  if (dados.acao === 'inserir') {
    banco.alunos.push({ id: proximoId(banco.alunos), matricula: matricula, nome: nome, turma_id: turmaId, ativo: ativo });
  } else {
    let aluno = buscarPorId(banco.alunos, dados.id);
    aluno.matricula = matricula;
    aluno.nome = nome;
    aluno.turma_id = turmaId;
    aluno.ativo = ativo;
  }
  gravarBanco(banco);
  return { ok: true };
}

function excluirAluno(id) {
  let banco = lerBanco();
  for (let i = 0; i < banco.entregas.length; i++) {
    if (banco.entregas[i].aluno_id == id) {
      return { erro: 'Aluno já retirou lanches. Marque como inativo em vez de excluir.' };
    }
  }
  removerPorId(banco.alunos, id);
  gravarBanco(banco);
  return { ok: true };
}

// ---------- usuários ----------

function listarUsuarios() {
  let usuarios = lerBanco().usuarios;
  for (let i = 0; i < usuarios.length; i++) {
    delete usuarios[i].senha; // a senha não vai para a tela
  }
  return usuarios;
}

function salvarUsuario(dados) {
  let banco = lerBanco();
  let matricula = dados.matricula.trim();
  let nome = dados.nome.trim();

  if (matricula === '' || nome === '') return { erro: 'Preencha matrícula e nome.' };
  if (dados.perfil !== 'atendente' && dados.perfil !== 'supervisor') return { erro: 'Perfil inválido.' };
  if (dados.acao === 'inserir' && dados.senha === '') return { erro: 'Informe a senha.' };
  for (let i = 0; i < banco.usuarios.length; i++) {
    if (banco.usuarios[i].matricula === matricula && banco.usuarios[i].id != dados.id) {
      return { erro: 'Matrícula já cadastrada.' };
    }
  }

  if (dados.acao === 'inserir') {
    banco.usuarios.push({ id: proximoId(banco.usuarios), matricula: matricula, nome: nome, senha: dados.senha, perfil: dados.perfil, ativo: 1 });
  } else {
    let usuario = buscarPorId(banco.usuarios, dados.id);
    usuario.matricula = matricula;
    usuario.nome = nome;
    usuario.perfil = dados.perfil;
    if (dados.senha !== '') usuario.senha = dados.senha; // em branco = manter a atual
  }
  gravarBanco(banco);
  return { ok: true };
}

function excluirUsuario(id) {
  let banco = lerBanco();
  removerPorId(banco.usuarios, id);
  // As entregas desse usuário continuam, mas sem atendente
  for (let i = 0; i < banco.entregas.length; i++) {
    if (banco.entregas[i].usuario_id == id) banco.entregas[i].usuario_id = null;
  }
  gravarBanco(banco);
  return { ok: true };
}

// ---------- entregas ----------

// Entregas de um dia. Se turmaId vier vazio, traz todas as turmas.
function listarEntregas(data, turmaId) {
  let banco = lerBanco();
  let lista = [];
  for (let i = 0; i < banco.entregas.length; i++) {
    let entrega = banco.entregas[i];
    let aluno = buscarPorId(banco.alunos, entrega.aluno_id);
    if (entrega.data !== data) continue;
    if (turmaId !== '' && aluno.turma_id != turmaId) continue;

    let atendente = buscarPorId(banco.usuarios, entrega.usuario_id);
    let nomeAtendente = '—';
    if (atendente !== null) nomeAtendente = atendente.nome;

    lista.push({
      hora: entrega.hora,
      matricula: aluno.matricula,
      nome: aluno.nome,
      turma: buscarPorId(banco.turmas, aluno.turma_id).nome,
      atendente: nomeAtendente
    });
  }
  return lista;
}

function registrarEntrega(matricula) {
  let banco = lerBanco();
  matricula = matricula.trim().toUpperCase(); // aceita "a001" ou "A001"

  let aluno = null;
  for (let i = 0; i < banco.alunos.length; i++) {
    if (banco.alunos[i].matricula.toUpperCase() === matricula && banco.alunos[i].ativo == 1) {
      aluno = banco.alunos[i];
    }
  }
  if (aluno === null) return { erro: 'Matrícula não encontrada ou aluno inativo.' };

  // Regra principal: um lanche por aluno por dia
  for (let i = 0; i < banco.entregas.length; i++) {
    let entrega = banco.entregas[i];
    if (entrega.aluno_id === aluno.id && entrega.data === hoje()) {
      return { erro: aluno.nome + ' já retirou o lanche hoje às ' + entrega.hora + '.' };
    }
  }

  banco.entregas.push({ id: proximoId(banco.entregas), aluno_id: aluno.id, usuario_id: Number(localStorage.getItem('id')), data: hoje(), hora: agora() });
  gravarBanco(banco);
  return { ok: true, aluno: { nome: aluno.nome, turma: buscarPorId(banco.turmas, aluno.turma_id).nome } };
}
