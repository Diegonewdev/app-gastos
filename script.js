// script.js - App Controle Motorista Uber (VERSÃO 3.0 COMPLETA)

// ============================================
// 1. VARIÁVEIS GLOBAIS
// ============================================
let registros = JSON.parse(localStorage.getItem('registros_motorista')) || [];
let kmRodados = parseFloat(localStorage.getItem('km_rodados')) || 0;
let modoHistorico = localStorage.getItem('modo_historico') || 'dia';

// ============================================
// 2. FUNÇÕES BÁSICAS
// ============================================
function formatarMoeda(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatarHora(data) {
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// 3. FUNÇÕES DE SALVAMENTO
// ============================================
function salvarDados() {
    localStorage.setItem('registros_motorista', JSON.stringify(registros));
    localStorage.setItem('km_rodados', kmRodados.toString());
    localStorage.setItem('modo_historico', modoHistorico);
}

// ============================================
// 4. FUNÇÕES DOS FORMULÁRIOS
// ============================================
function mostrarCorrida() {
    console.log("Mostrando formulário de corrida...");
    document.getElementById('form-corrida').classList.add('ativo');
    document.getElementById('form-gasto').classList.remove('ativo');
    document.getElementById('valor-corrida').focus();
}

function mostrarGasto() {
    console.log("Mostrando formulário de gasto...");
    document.getElementById('form-gasto').classList.add('ativo');
    document.getElementById('form-corrida').classList.remove('ativo');
    document.getElementById('valor-gasto').focus();
}

function esconderFormularios() {
    document.getElementById('form-corrida').classList.remove('ativo');
    document.getElementById('form-gasto').classList.remove('ativo');
}

function salvarCorrida() {
    const valorInput = document.getElementById('valor-corrida');
    const descInput = document.getElementById('descricao-corrida');
    
    const valor = parseFloat(valorInput.value);
    if (!valor || valor <= 0) {
        alert('Digite um valor válido para a corrida!');
        return;
    }
    
    const registro = {
        id: Date.now() + Math.random(),
        tipo: 'corrida',
        valor: valor,
        descricao: descInput.value || 'Corrida Uber',
        data: new Date().toISOString(),
        categoria: 'corrida'
    };
    
    registros.push(registro);
    salvarDados();
    esconderFormularios();
    atualizarDashboard();
    atualizarMetricasKM();
    renderizarRegistros();
    atualizarHistorico();
    
    // Limpa os campos
    valorInput.value = '';
    descInput.value = '';
}

function salvarGasto() {
    const valorInput = document.getElementById('valor-gasto');
    const catSelect = document.getElementById('categoria-gasto');
    const descInput = document.getElementById('descricao-gasto');
    
    const valor = parseFloat(valorInput.value);
    if (!valor || valor <= 0) {
        alert('Digite um valor válido para o gasto!');
        return;
    }
    
    const categorias = {
        combustivel: 'Combustível',
        alimentacao: 'Alimentação',
        estacionamento: 'Estacionamento',
        pedagio: 'Pedágio',
        lavagem: 'Lavagem',
        manutencao: 'Manutenção',
        outro: 'Outro'
    };
    
    const registro = {
        id: Date.now() + Math.random(),
        tipo: 'gasto',
        valor: valor,
        descricao: descInput.value || categorias[catSelect.value],
        categoria: catSelect.value,
        data: new Date().toISOString()
    };
    
    registros.push(registro);
    salvarDados();
    esconderFormularios();
    atualizarDashboard();
    atualizarMetricasKM();
    renderizarRegistros();
    atualizarHistorico();
    
    // Limpa os campos
    valorInput.value = '';
    descInput.value = '';
}

// ============================================
// 5. FUNÇÕES DO DASHBOARD
// ============================================
function atualizarDashboard() {
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    const ganhos = registrosHoje
        .filter(r => r.tipo === 'corrida')
        .reduce((total, r) => total + r.valor, 0);
    
    const gastos = registrosHoje
        .filter(r => r.tipo === 'gasto')
        .reduce((total, r) => total + r.valor, 0);
    
    const saldo = ganhos - gastos;
    
    document.getElementById('total-ganhos').textContent = formatarMoeda(ganhos);
    document.getElementById('total-gastos').textContent = formatarMoeda(gastos);
    document.getElementById('saldo-dia').textContent = formatarMoeda(saldo);
    document.getElementById('saldo-dia').style.color = saldo >= 0 ? '#4CAF50' : '#f44336';
    
    // Atualiza contador
    document.getElementById('total-registros').textContent = registrosHoje.length;
}

function atualizarMetricasKM() {
    const km = kmRodados || parseFloat(document.getElementById('km-rodados').value) || 0;
    
    if (km <= 0) {
        document.getElementById('receita-km').textContent = 'R$ 0,00';
        document.getElementById('custo-km').textContent = 'R$ 0,00';
        document.getElementById('lucro-km').textContent = 'R$ 0,00';
        document.getElementById('media-geral').textContent = 'R$ 0,00/km';
        return;
    }
    
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    const ganhos = registrosHoje
        .filter(r => r.tipo === 'corrida')
        .reduce((total, r) => total + r.valor, 0);
    
    const gastos = registrosHoje
        .filter(r => r.tipo === 'gasto')
        .reduce((total, r) => total + r.valor, 0);
    
    const lucro = ganhos - gastos;
    
    // Cálculos por KM
    const receitaPorKm = ganhos / km;
    const custoPorKm = gastos / km;
    const lucroPorKm = lucro / km;
    
    // Atualiza display
    document.getElementById('receita-km').textContent = formatarMoeda(receitaPorKm);
    document.getElementById('custo-km').textContent = formatarMoeda(custoPorKm);
    document.getElementById('lucro-km').textContent = formatarMoeda(lucroPorKm);
    document.getElementById('media-geral').textContent = formatarMoeda(lucroPorKm) + '/km';
    
    // Cores indicativas
    document.getElementById('lucro-km').style.color = lucroPorKm >= 0 ? '#4CAF50' : '#f44336';
}

// ============================================
// 6. FUNÇÕES DA TABELA
// ============================================
function renderizarRegistros(filtro = 'todos') {
    const hoje = new Date().toDateString();
    let registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    if (filtro !== 'todos') {
        registrosHoje = registrosHoje.filter(r => r.tipo === filtro);
    }
    
    // Ordena por data (mais recente primeiro)
    registrosHoje.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const tbody = document.getElementById('corpo-tabela');
    tbody.innerHTML = '';
    
    if (registrosHoje.length === 0) {
        document.getElementById('sem-registros').style.display = 'block';
        document.getElementById('tabela-registros').style.display = 'none';
        return;
    }
    
    document.getElementById('sem-registros').style.display = 'none';
    document.getElementById('tabela-registros').style.display = 'table';
    
    registrosHoje.forEach(registro => {
        const tr = document.createElement('tr');
        
        // Célula Tipo
        const tdTipo = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge badge-${registro.tipo}`;
        badge.textContent = registro.tipo === 'corrida' ? '💰 Corrida' : '💸 Gasto';
        tdTipo.appendChild(badge);
        
        // Célula Descrição
        const tdDesc = document.createElement('td');
        tdDesc.textContent = registro.descricao;
        
        // Célula Valor
        const tdValor = document.createElement('td');
        tdValor.textContent = formatarMoeda(registro.valor);
        tdValor.style.color = registro.tipo === 'corrida' ? '#4CAF50' : '#f44336';
        tdValor.style.fontWeight = 'bold';
        
        // Célula Hora
        const tdHora = document.createElement('td');
        const data = new Date(registro.data);
        tdHora.textContent = formatarHora(data);
        
        // Célula Ações
        const tdAcoes = document.createElement('td');
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn-excluir';
        btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
        btnExcluir.onclick = () => excluirRegistro(registro.id);
        tdAcoes.appendChild(btnExcluir);
        
        // Monta linha
        tr.appendChild(tdTipo);
        tr.appendChild(tdDesc);
        tr.appendChild(tdValor);
        tr.appendChild(tdHora);
        tr.appendChild(tdAcoes);
        
        tbody.appendChild(tr);
    });
}

function excluirRegistro(id) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        registros = registros.filter(r => r.id !== id);
        salvarDados();
        atualizarDashboard();
        atualizarMetricasKM();
        renderizarRegistros();
        atualizarHistorico();
    }
}

function limparRegistrosHoje() {
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    if (registrosHoje.length === 0) {
        alert('Não há registros para limpar hoje!');
        return;
    }
    
    if (confirm(`Deseja limpar todos os ${registrosHoje.length} registros de hoje?`)) {
        // Remove apenas registros de hoje
        registros = registros.filter(r => new Date(r.data).toDateString() !== hoje);
        salvarDados();
        atualizarDashboard();
        atualizarMetricasKM();
        renderizarRegistros();
        atualizarHistorico();
        alert('Registros de hoje limpos com sucesso!');
    }
}

// ============================================
// 7. FUNÇÃO PARA SALVAR KM
// ============================================
function salvarKM() {
    const kmInput = document.getElementById('km-rodados');
    const km = parseFloat(kmInput.value);
    
    if (!km || km <= 0) {
        alert('Digite uma quilometragem válida!');
        return;
    }
    
    kmRodados = km;
    salvarDados();
    atualizarMetricasKM();
    atualizarHistorico();
    
    // Feedback visual
    const btn = document.getElementById('salvar-km');
    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.background;
    
    btn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
    btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = originalBg;
    }, 1500);
}

// ============================================
// 8. FUNÇÕES PARA CALCULAR KM ACUMULADOS
// ============================================

function calcularKMMensal() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Filtra registros do mês atual
    const registrosMes = registros.filter(r => {
        const dataReg = new Date(r.data);
        return dataReg.getMonth() === mesAtual && 
               dataReg.getFullYear() === anoAtual;
    });
    
    // Conta dias únicos com registros no mês
    const diasUnicos = new Set();
    registrosMes.forEach(r => {
        const data = new Date(r.data);
        diasUnicos.add(data.toDateString());
    });
    
    const diasTrabalhados = diasUnicos.size;
    
    // KM total do mês = dias trabalhados * KM rodados hoje
    // (Esta é uma estimativa - na versão completa, salvaríamos o KM de cada dia)
    const kmTotalMes = diasTrabalhados * kmRodados;
    
    return {
        kmTotal: kmTotalMes,
        diasTrabalhados: diasTrabalhados,
        kmMedioPorDia: kmRodados
    };
}

function calcularKMTodoPeriodo() {
    // Conta todos os dias únicos com registros
    const diasUnicos = new Set();
    registros.forEach(r => {
        const data = new Date(r.data);
        diasUnicos.add(data.toDateString());
    });
    
    const diasTrabalhadosTotal = diasUnicos.size;
    
    // KM total do período = todos os dias trabalhados * KM rodados hoje
    const kmTotalPeriodo = diasTrabalhadosTotal * kmRodados;
    
    return {
        kmTotal: kmTotalPeriodo,
        diasTrabalhados: diasTrabalhadosTotal,
        kmMedioPorDia: kmRodados
    };
}

// ============================================
// 9. FUNÇÕES DE HISTÓRICO (DUPLO MODO COM KM ACUMULADO)
// ============================================
function alternarModoHistorico(modo) {
    modoHistorico = modo;
    salvarDados();
    
    // Atualiza botões
    document.querySelectorAll('.btn-historico').forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.getAttribute('data-modo') === modo) {
            btn.classList.add('ativo');
        }
    });
    
    // Atualiza labels conforme o modo
    if (modo === 'dia') {
        document.getElementById('label-media').textContent = 'Saldo do Dia';
        document.getElementById('label-melhor').textContent = 'Melhor do Dia';
        document.getElementById('label-km').textContent = 'KM Hoje';
        document.getElementById('label-km-mes').textContent = 'KM/Mês (Estimado)';
        document.getElementById('label-total-km').textContent = 'Total KM (Estimado)';
        document.getElementById('label-lucro').textContent = 'Lucro/KM Hoje';
    } else {
        document.getElementById('label-media').textContent = 'Média Diária';
        document.getElementById('label-melhor').textContent = 'Melhor Dia';
        document.getElementById('label-km').textContent = 'KM/Dia Médio';
        document.getElementById('label-km-mes').textContent = 'KM do Mês';
        document.getElementById('label-total-km').textContent = 'KM Total (Período)';
        document.getElementById('label-lucro').textContent = 'Lucro/KM Médio';
    }
    
    atualizarHistorico();
}

function atualizarHistorico() {
    if (modoHistorico === 'dia') {
        atualizarHistoricoDiaAtual();
    } else {
        atualizarHistoricoMensal();
    }
}

// MODO 1: DIA ATUAL (SIMPLES)
function atualizarHistoricoDiaAtual() {
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    const ganhosHoje = registrosHoje
        .filter(r => r.tipo === 'corrida')
        .reduce((total, r) => total + r.valor, 0);
    
    const gastosHoje = registrosHoje
        .filter(r => r.tipo === 'gasto')
        .reduce((total, r) => total + r.valor, 0);
    
    const saldoHoje = ganhosHoje - gastosHoje;
    
    // Calcula KM acumulados
    const kmMensal = calcularKMMensal();
    const kmTotal = calcularKMTodoPeriodo();
    
    // Atualiza display
    document.getElementById('media-diaria').textContent = formatarMoeda(saldoHoje);
    document.getElementById('melhor-dia').textContent = formatarMoeda(saldoHoje);
    document.getElementById('km-medio').textContent = kmRodados + ' km';
    document.getElementById('km-mes').textContent = kmMensal.kmTotal.toFixed(0) + ' km';
    document.getElementById('total-km').textContent = kmTotal.kmTotal.toFixed(0) + ' km';
    
    // Lucro por KM (hoje)
    const lucroKmHoje = kmRodados > 0 ? saldoHoje / kmRodados : 0;
    document.getElementById('lucro-km-medio').textContent = formatarMoeda(lucroKmHoje);
}

// MODO 2: MÉDIA MENSAL (COMPLETO)
function atualizarHistoricoMensal() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Filtra registros do mês atual
    const registrosMes = registros.filter(r => {
        const dataReg = new Date(r.data);
        return dataReg.getMonth() === mesAtual && 
               dataReg.getFullYear() === anoAtual;
    });
    
    // Agrupa por dia
    const dias = {};
    registrosMes.forEach(r => {
        const data = new Date(r.data);
        const chaveDia = data.toDateString();
        
        if (!dias[chaveDia]) {
            dias[chaveDia] = {
                ganhos: 0,
                gastos: 0,
                km: kmRodados // Para simplificar, usa o KM atual
            };
        }
        
        if (r.tipo === 'corrida') {
            dias[chaveDia].ganhos += r.valor;
        } else {
            dias[chaveDia].gastos += r.valor;
        }
    });
    
    const diasArray = Object.values(dias);
    const diasTrabalhados = diasArray.length;
    
    if (diasTrabalhados === 0) {
        document.getElementById('media-diaria').textContent = 'R$ 0,00';
        document.getElementById('melhor-dia').textContent = 'R$ 0,00';
        document.getElementById('km-medio').textContent = '0 km';
        document.getElementById('km-mes').textContent = '0 km';
        document.getElementById('total-km').textContent = '0 km';
        document.getElementById('lucro-km-medio').textContent = 'R$ 0,00';
        return;
    }
    
    // Calcula totais
    const totalGanhos = diasArray.reduce((sum, dia) => sum + dia.ganhos, 0);
    const totalGastos = diasArray.reduce((sum, dia) => sum + dia.gastos, 0);
    const totalKmMes = diasArray.reduce((sum, dia) => sum + dia.km, 0);
    
    // Calcula KM total de todo o período
    const kmTotalPeriodo = calcularKMTodoPeriodo();
    
    // Calcula médias
    const mediaDiaria = (totalGanhos - totalGastos) / diasTrabalhados;
    const kmMedioDia = totalKmMes / diasTrabalhados;
    const lucroKmMedio = totalKmMes > 0 ? (totalGanhos - totalGastos) / totalKmMes : 0;
    
    // Encontra melhor dia
    let melhorDia = 0;
    diasArray.forEach(dia => {
        const saldoDia = dia.ganhos - dia.gastos;
        if (saldoDia > melhorDia) {
            melhorDia = saldoDia;
        }
    });
    
    // Atualiza display
    document.getElementById('media-diaria').textContent = formatarMoeda(mediaDiaria);
    document.getElementById('melhor-dia').textContent = formatarMoeda(melhorDia);
    document.getElementById('km-medio').textContent = kmMedioDia.toFixed(1) + ' km';
    document.getElementById('km-mes').textContent = totalKmMes.toFixed(0) + ' km';
    document.getElementById('total-km').textContent = kmTotalPeriodo.kmTotal.toFixed(0) + ' km';
    document.getElementById('lucro-km-medio').textContent = formatarMoeda(lucroKmMedio);
}

// ============================================
// 10. FUNÇÕES DE EXPORTAÇÃO E RELATÓRIO
// ============================================
function exportarCSV() {
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    if (registrosHoje.length === 0) {
        alert('Não há dados para exportar hoje!');
        return;
    }
    
    let csv = 'Tipo,Descrição,Valor(R$),Data,Hora\n';
    
    registrosHoje.forEach(r => {
        const data = new Date(r.data);
        csv += `${r.tipo === 'corrida' ? 'Corrida' : 'Gasto'},`;
        csv += `"${r.descricao}",`;
        csv += `${r.valor.toFixed(2)},`;
        csv += `${data.toLocaleDateString('pt-BR')},`;
        csv += `${data.toLocaleTimeString('pt-BR')}\n`;
    });
    
    // Adiciona resumo
    const ganhos = registrosHoje.filter(r => r.tipo === 'corrida').reduce((t, r) => t + r.valor, 0);
    const gastos = registrosHoje.filter(r => r.tipo === 'gasto').reduce((t, r) => t + r.valor, 0);
    const saldo = ganhos - gastos;
    
    csv += '\nRESUMO DO DIA\n';
    csv += `Total Ganhos,${ganhos.toFixed(2)}\n`;
    csv += `Total Gastos,${gastos.toFixed(2)}\n`;
    csv += `Saldo Líquido,${saldo.toFixed(2)}\n`;
    csv += `KM Rodados,${kmRodados}\n`;
    
    if (kmRodados > 0) {
        csv += `\nMÉTRICAS POR KM\n`;
        csv += `Receita por KM,${(ganhos / kmRodados).toFixed(2)}\n`;
        csv += `Custo por KM,${(gastos / kmRodados).toFixed(2)}\n`;
        csv += `Lucro por KM,${(saldo / kmRodados).toFixed(2)}\n`;
    }
    
    // Adiciona histórico de KM
    const kmMensal = calcularKMMensal();
    const kmTotal = calcularKMTodoPeriodo();
    
    csv += `\nHISTÓRICO DE KM\n`;
    csv += `KM Hoje,${kmRodados}\n`;
    csv += `KM do Mês (Estimado),${kmMensal.kmTotal.toFixed(0)}\n`;
    csv += `KM Total (Estimado),${kmTotal.kmTotal.toFixed(0)}\n`;
    csv += `Dias Trabalhados no Mês,${kmMensal.diasTrabalhados}\n`;
    csv += `Total de Dias Trabalhados,${kmTotal.diasTrabalhados}\n`;
    
    // Cria e baixa arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dataHoje = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `controle_motorista_${dataHoje}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function fazerBackup() {
    const dadosBackup = {
        registros: registros,
        kmRodados: kmRodados,
        modoHistorico: modoHistorico,
        dataBackup: new Date().toISOString(),
        versao: '3.0'
    };
    
    const dadosStr = JSON.stringify(dadosBackup, null, 2);
    const blob = new Blob([dadosStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dataHoje = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `backup_motorista_${dataHoje}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Backup criado com sucesso!\nTotal de registros: ${registros.length}`);
}

function mostrarRelatorio() {
    const hoje = new Date().toDateString();
    const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
    
    const ganhos = registrosHoje.filter(r => r.tipo === 'corrida').reduce((t, r) => t + r.valor, 0);
    const gastos = registrosHoje.filter(r => r.tipo === 'gasto').reduce((t, r) => t + r.valor, 0);
    const saldo = ganhos - gastos;
    
    // Atualiza modal
    document.getElementById('relatorio-ganhos').textContent = formatarMoeda(ganhos);
    document.getElementById('relatorio-gastos').textContent = formatarMoeda(gastos);
    document.getElementById('relatorio-lucro').textContent = formatarMoeda(saldo);
    document.getElementById('relatorio-km').textContent = `${kmRodados} km`;
    
    // Mostra modal
    document.getElementById('modal-relatorio').classList.add('active');
}

function fecharModal() {
    document.getElementById('modal-relatorio').classList.remove('active');
}

// ============================================
// 11. CONFIGURAÇÃO DOS EVENT LISTENERS
// ============================================
function configurarEventListeners() {
    console.log("Configurando event listeners...");
    
    // BOTÕES PRINCIPAIS
    document.getElementById('btn-nova-corrida').addEventListener('click', mostrarCorrida);
    document.getElementById('btn-novo-gasto').addEventListener('click', mostrarGasto);
    document.getElementById('salvar-km').addEventListener('click', salvarKM);
    document.getElementById('btn-limpar-hoje').addEventListener('click', limparRegistrosHoje);
    document.getElementById('btn-relatorio').addEventListener('click', mostrarRelatorio);
    
    // FORMULÁRIOS
    document.getElementById('salvar-corrida').addEventListener('click', salvarCorrida);
    document.getElementById('cancelar-corrida').addEventListener('click', esconderFormularios);
    document.getElementById('salvar-gasto').addEventListener('click', salvarGasto);
    document.getElementById('cancelar-gasto').addEventListener('click', esconderFormularios);
    
    // FILTROS DA TABELA
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove classe ativa de todos
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            // Adiciona no clicado
            this.classList.add('ativo');
            // Aplica filtro
            const tipo = this.getAttribute('data-tipo');
            renderizarRegistros(tipo);
        });
    });
    
    // MODOS DO HISTÓRICO
    document.querySelectorAll('.btn-historico').forEach(btn => {
        btn.addEventListener('click', function() {
            const modo = this.getAttribute('data-modo');
            alternarModoHistorico(modo);
        });
    });
    
    // ENTER NOS CAMPOS
    document.getElementById('valor-corrida').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') salvarCorrida();
    });
    
    document.getElementById('valor-gasto').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') salvarGasto();
    });
    
    document.getElementById('km-rodados').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') salvarKM();
    });
    
    // OUTROS BOTÕES
    document.getElementById('btn-exportar').addEventListener('click', exportarCSV);
    document.getElementById('btn-backup').addEventListener('click', fazerBackup);
    document.getElementById('btn-config').addEventListener('click', () => {
        const kmMensal = calcularKMMensal();
        const kmTotal = calcularKMTodoPeriodo();
        
        alert('Configurações:\n\n' +
              `• Registros: ${registros.length}\n` +
              `• KM Hoje: ${kmRodados}\n` +
              `• KM do Mês: ${kmMensal.kmTotal.toFixed(0)} km\n` +
              `• KM Total: ${kmTotal.kmTotal.toFixed(0)} km\n` +
              `• Dias Trabalhados (Mês): ${kmMensal.diasTrabalhados}\n` +
              `• Total Dias Trabalhados: ${kmTotal.diasTrabalhados}\n` +
              `• Modo histórico: ${modoHistorico === 'dia' ? 'Dia Atual' : 'Média Mensal'}\n\n` +
              'Use o backup para salvar seus dados!');
    });
    
    // MODAL
    document.getElementById('fechar-modal').addEventListener('click', fecharModal);
    document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
    document.getElementById('btn-compartilhar').addEventListener('click', () => {
        const hoje = new Date().toDateString();
        const registrosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
        
        const ganhos = registrosHoje.filter(r => r.tipo === 'corrida').reduce((t, r) => t + r.valor, 0);
        const gastos = registrosHoje.filter(r => r.tipo === 'gasto').reduce((t, r) => t + r.valor, 0);
        const saldo = ganhos - gastos;
        
        const texto = `📊 Relatório Motorista Uber\n` +
                     `Data: ${formatarData(new Date())}\n` +
                     `Ganhos: ${formatarMoeda(ganhos)}\n` +
                     `Gastos: ${formatarMoeda(gastos)}\n` +
                     `Saldo: ${formatarMoeda(saldo)}\n` +
                     `KM Hoje: ${kmRodados} km\n` +
                     `Lucro/KM: ${kmRodados > 0 ? formatarMoeda(saldo / kmRodados) : 'R$ 0,00'}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Relatório Motorista Uber',
                text: texto,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(texto).then(() => {
                alert('Relatório copiado para a área de transferência!');
            });
        }
    });
    
    // Fecha modal ao clicar fora
    document.getElementById('modal-relatorio').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-relatorio')) {
            fecharModal();
        }
    });
    
    console.log("Event listeners configurados com sucesso!");
}

// ============================================
// 12. INICIALIZAÇÃO DO APP
// ============================================
function inicializarApp() {
    console.log("Inicializando app do motorista...");
    
    // Atualiza data de hoje
    document.getElementById('data-hoje').textContent = formatarData(new Date());
    
    // Carrega KM salvo
    if (kmRodados > 0) {
        document.getElementById('km-rodados').value = kmRodados;
    }
    
    // Atualiza displays
    atualizarDashboard();
    atualizarMetricasKM();
    renderizarRegistros();
    
    // Configura modo histórico
    alternarModoHistorico(modoHistorico);
    
    // Configura event listeners
    configurarEventListeners();
    
    console.log("App inicializado com sucesso! 🚗");
}

// ============================================
// 13. INICIA O APP QUANDO A PÁGINA CARREGAR
// ============================================
document.addEventListener('DOMContentLoaded', inicializarApp);

// ============================================
// 14. FUNÇÃO DE DEBUG (OPCIONAL)
// ============================================
window.debugApp = function() {
    console.log('=== DEBUG APP ===');
    console.log('Registros:', registros.length);
    console.log('KM Rodados:', kmRodados);
    console.log('Modo Histórico:', modoHistorico);
    
    const kmMensal = calcularKMMensal();
    const kmTotal = calcularKMTodoPeriodo();
    
    console.log('KM Mensal:', kmMensal);
    console.log('KM Total:', kmTotal);
    
    console.log('LocalStorage:', {
        registros: localStorage.getItem('registros_motorista')?.length,
        km: localStorage.getItem('km_rodados'),
        modo: localStorage.getItem('modo_historico')
    });
    console.log('=== FIM DEBUG ===');
};
