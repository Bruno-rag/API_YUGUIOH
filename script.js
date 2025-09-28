// Encontre os elementos de seleção e o botão
const btnEnviar = document.getElementById('btn-enviar');
const filtroGame = document.getElementById('filtro-game');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroAtributo = document.getElementById('filtro-atributo');
const cardResultsContainer = document.getElementById('card-results-container');
const loadingIndicator = document.getElementById('loading-indicator');

// Dados dos filtros para cada jogo
const gameFilters = {
    'Yu-Gi-Oh!': {
        types: ['Normal Monster', 'Effect Monster', 'Spell Card', 'Trap Card'],
        attributes: ['DARK', 'EARTH', 'FIRE', 'LIGHT', 'WATER', 'WIND']
    },
    'Hearthstone': {
        types: ['Minion', 'Spell', 'Weapon'],
        attributes: ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior', 'Neutral']
    },
    'Magic: The Gathering': {
        types: ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land'],
        attributes: ['white', 'blue', 'black', 'red', 'green', 'colorless']
    }
};

// Mapeia o nome do jogo para a URL da API
const apis = {
    'Yu-Gi-Oh!': 'https://db.ygoprodeck.com/api/v7/cardinfo.php',
    'Hearthstone': 'https://api.hearthstonejson.com/v1/latest/enUS/cards.json',
    'Magic: The Gathering': 'https://api.scryfall.com/cards/search'
};

// Funções de normalização para cada jogo
function normalizarYuGiOh(card) {
    return {
        name: card.name,
        type: card.type,
        attribute: card.attribute || 'N/A',
        level: card.level || 'N/A',
        imageUrl: card.card_images?.[0]?.image_url,
        game: 'Yu-Gi-Oh!'
    };
}

function normalizarHearthstone(card) {
    return {
        name: card.name,
        type: card.type || 'N/A',
        attribute: card.cardClass || 'N/A',
        level: card.cost || 'N/A',
        imageUrl: `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${card.id}.png`,
        game: 'Hearthstone'
    };
}

function normalizarMagic(card) {
    return {
        name: card.name,
        type: card.type_line || 'N/A',
        attribute: card.colors?.join(', ') || 'N/A',
        level: card.cmc || 'N/A',
        imageUrl: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
        game: 'Magic: The Gathering'
    };
}

// Função para exibir os resultados na tela
function exibirResultados(cartas) {
    cardResultsContainer.innerHTML = '';

    if (!cartas || cartas.length === 0) {
        const noResultMessage = document.createElement('p');
        noResultMessage.textContent = 'Nenhuma carta encontrada com esses filtros.';
        cardResultsContainer.appendChild(noResultMessage);
        return;
    }

    cartas.forEach(carta => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        cardDiv.innerHTML = `
            <h3>${carta.name || 'Nome não disponível'}</h3>
            <p><strong>Jogo:</strong> ${carta.game}</p>
            <img src="${carta.imageUrl}" alt="${carta.name}" style="width: 200px;">
            <p><strong>Tipo:</strong> ${carta.type || 'N/A'}</p>
            <p><strong>Atributo:</strong> ${carta.attribute || 'N/A'}</p>
        `;

        cardResultsContainer.appendChild(cardDiv);
    });
}

// Função para atualizar os filtros com base no jogo selecionado
function atualizarFiltros() {
    const jogoSelecionado = filtroGame.value;
    const filtrosDoJogo = gameFilters[jogoSelecionado];

    // Limpa os filtros existentes
    filtroTipo.innerHTML = '<option value="">-- Selecione o Tipo --</option>';
    filtroAtributo.innerHTML = '<option value="">-- Selecione o Atributo --</option>';

    if (filtrosDoJogo) {
        // Preenche o filtro de Tipo
        filtrosDoJogo.types.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            filtroTipo.appendChild(option);
        });
        
        filtrosDoJogo.attributes.forEach(atributo => {
            const option = document.createElement('option');
            option.value = atributo;
            option.textContent = atributo;
            filtroAtributo.appendChild(option);
        });
    }
}

// Função principal para buscar dados da API
async function buscarDadosAPI() {
    cardResultsContainer.innerHTML = '';
    loadingIndicator.style.display = 'block';
    
    const gameSelecionado = filtroGame.value;
    const tipoSelecionado = filtroTipo.value;
    const atributoSelecionado = filtroAtributo.value;

    if (!gameSelecionado) {
        alert("Por favor, selecione um card game.");
        loadingIndicator.style.display = 'none';
        return;
    }

    const apiUrlBase = apis[gameSelecionado];
    let dataFromApi = { data: [] };

    // Lógica para Yu-Gi-Oh!
    if (gameSelecionado === 'Yu-Gi-Oh!') {
        let params = {};
        if (tipoSelecionado) params.type = tipoSelecionado;
        if (atributoSelecionado) params.attribute = atributoSelecionado;
        
        const query = new URLSearchParams(params).toString();
        const apiUrl = `${apiUrlBase}?${query}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Erro na requisição da API de Yu-Gi-Oh!: ' + response.statusText);
            dataFromApi = await response.json();
        } catch (error) {
            console.error(error);
            cardResultsContainer.innerHTML = `<p>Erro ao buscar dados de Yu-Gi-Oh!. Tente novamente.</p>`;
            loadingIndicator.style.display = 'none';
            return;
        }
    
    // Lógica para Hearthstone
    } else if (gameSelecionado === 'Hearthstone') {
        try {
            const response = await fetch(apiUrlBase);
            if (!response.ok) throw new Error('Erro na requisição da API de Hearthstone: ' + response.statusText);
            const allCards = await response.json();
            
            let filteredCards = allCards.filter(card => {
                let match = true;
                if (tipoSelecionado && card.type !== tipoSelecionado.toUpperCase()) match = false;
                if (atributoSelecionado && card.cardClass !== atributoSelecionado.toUpperCase()) match = false;
                return match;
            });

            dataFromApi.data = filteredCards;

        } catch (error) {
            console.error(error);
            cardResultsContainer.innerHTML = `<p>Erro ao buscar dados de Hearthstone. Tente novamente.</p>`;
            loadingIndicator.style.display = 'none';
            return;
        }
    
    // Lógica para Magic
    } else if (gameSelecionado === 'Magic: The Gathering') {
        let scryfallQuery = '';
        if (tipoSelecionado) scryfallQuery += `type:${tipoSelecionado.toLowerCase()} `;
        if (atributoSelecionado) scryfallQuery += `color:${atributoSelecionado.toLowerCase()} `;

        const apiUrl = `${apiUrlBase}?q=${encodeURIComponent(scryfallQuery)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Erro na requisição da API de Magic: ' + response.statusText);
            dataFromApi = await response.json();
        } catch (error) {
            console.error(error);
            cardResultsContainer.innerHTML = `<p>Erro ao buscar dados de Magic. Tente novamente.</p>`;
            loadingIndicator.style.display = 'none';
            return;
        }
    }
    
    let cartas = [];
    if (gameSelecionado === 'Yu-Gi-Oh!' && dataFromApi.data && dataFromApi.data.length > 0) {
        cartas = dataFromApi.data.slice(0, 3).map(normalizarYuGiOh);
    } else if (gameSelecionado === 'Hearthstone' && dataFromApi.data && dataFromApi.data.length > 0) {
        cartas = dataFromApi.data.slice(0, 3).map(normalizarHearthstone);
    } else if (gameSelecionado === 'Magic: The Gathering' && dataFromApi.data && dataFromApi.data.length > 0) {
        cartas = dataFromApi.data.slice(0, 3).map(normalizarMagic);
    }
    
    loadingIndicator.style.display = 'none';
    exibirResultados(cartas);
}

// Adiciona o ouvinte de evento 'change' ao seletor de jogo
filtroGame.addEventListener('change', atualizarFiltros);

// Adiciona o ouvinte de evento 'click' ao botão
btnEnviar.addEventListener('click', buscarDadosAPI);

// Chama a função para preencher os filtros na carga da página
atualizarFiltros();