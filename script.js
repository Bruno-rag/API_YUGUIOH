// Função para buscar cartas por tipo usando YGOPRODeck API
async function buscarPorTipo(tipo) {
    console.log('Buscando cartas do tipo usando YGOPRODeck API:', tipo);
    try {
        const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?type=${encodeURIComponent(tipo)}`;
        console.log('URL da requisição (tipo):', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('Resposta da API YGOPRODeck (tipo):', data);
        
        if (data.error) {
            console.error('Erro retornado pela API YGOPRODeck:', data.error);
            return [];
        }
        
        // Mapear os dados para um formato consistente
        const cartas = (data.data || []).map(carta => ({
            name: carta.name,
            type: carta.type,
            attribute: carta.attribute,
            level: carta.level,
            image_url: carta.card_images?.[0]?.image_url,
            desc: carta.desc,
            atk: carta.atk,
            def: carta.def,
            id: carta.id
        }));
        
        console.log(`YGOPRODeck: Encontradas ${cartas.length} cartas do tipo ${tipo}`);
        return cartas;
    } catch (error) {
        console.error('Erro na API YGOPRODeck:', error);
        return [];
    }
}

// Função para buscar cartas por atributo usando JustTCG API
async function buscarPorAtributo(atributo) {
    console.log('Buscando cartas do atributo usando JustTCG API:', atributo);
    try {
        // Usando a API JustTCG para buscar cartas
        const response = await fetch('https://api.tcgplayer.com/catalog/products', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer tcg_1e4b2667040f48f3bebac5dd622f8ec6'
            }
        });
        const data = await response.json();
        console.log('Resposta da JustTCG API:', data);

        // Filtrar e mapear os resultados para o formato padrão
        const cartas = data.results ? data.results
            .filter(card => card.attribute === atributo)
            .map(carta => ({
                name: carta.name,
                type: carta.productType || 'N/A',
                attribute: carta.attribute,
                level: carta.level || 'N/A',
                image_url: carta.imageUrl,
                desc: carta.description || '',
                atk: carta.attack,
                def: carta.defense,
                id: carta.productId
            })) : [];

        console.log(`JustTCG: Encontradas ${cartas.length} cartas do atributo ${atributo}`);
        return cartas;
    } catch (error) {
        console.error('Erro na JustTCG API:', error);
        // Fallback para a YGOPRODeck API em caso de erro
        console.log('Tentando fallback para YGOPRODeck API...');
        return await buscarPorAtributoFallback(atributo);
    }
}

// Função para buscar cartas por nível usando Yu-Gi-Oh! Card API
async function buscarPorNivel(nivel) {
    console.log('Buscando cartas do nível usando Yu-Gi-Oh! Card API:', nivel);
    try {
        const response = await fetch(`https://ygo-api.vercel.app/api/v1/cards?level=${nivel}`);
        const data = await response.json();
        console.log('Resposta da Yu-Gi-Oh! Card API:', data);

        // Mapear os resultados para o formato padrão
        const cartas = Array.isArray(data) ? data.map(carta => ({
            name: carta.name,
            type: carta.type || 'N/A',
            attribute: carta.attribute || 'N/A',
            level: carta.level,
            image_url: carta.card_images?.[0]?.image_url || carta.image_url,
            desc: carta.desc || '',
            atk: carta.atk,
            def: carta.def,
            id: carta.id
        })) : [];

        console.log(`Yu-Gi-Oh! Card API: Encontradas ${cartas.length} cartas do nível ${nivel}`);
        return cartas;
    } catch (error) {
        console.error('Erro na Yu-Gi-Oh! Card API:', error);
        // Fallback para a YGOPRODeck API em caso de erro
        console.log('Tentando fallback para YGOPRODeck API...');
        return await buscarPorNivelFallback(nivel);
    }
}

// Funções de fallback usando YGOPRODeck API
async function buscarPorAtributoFallback(atributo) {
    try {
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?attribute=${encodeURIComponent(atributo)}`);
        const data = await response.json();
        return data.data ? data.data.map(carta => ({
            name: carta.name,
            type: carta.type,
            attribute: carta.attribute,
            level: carta.level,
            image_url: carta.card_images?.[0]?.image_url,
            desc: carta.desc,
            atk: carta.atk,
            def: carta.def,
            id: carta.id
        })) : [];
    } catch (error) {
        console.error('Erro no fallback para atributo:', error);
        return [];
    }
}

async function buscarPorNivelFallback(nivel) {
    try {
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?level=${encodeURIComponent(nivel)}`);
        const data = await response.json();
        return data.data ? data.data.map(carta => ({
            name: carta.name,
            type: carta.type,
            attribute: carta.attribute,
            level: carta.level,
            image_url: carta.card_images?.[0]?.image_url,
            desc: carta.desc,
            atk: carta.atk,
            def: carta.def,
            id: carta.id
        })) : [];
    } catch (error) {
        console.error('Erro no fallback para nível:', error);
        return [];
    }
}

// Função para buscar cartas com múltiplos filtros
async function buscarCartasFiltradas(tipo, nivel, atributo) {
    console.log('Iniciando busca com filtros:', { tipo, nivel, atributo });
    
    try {
        // Construir a URL com todos os filtros necessários
        let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?';
        const params = [];
        
        if (tipo) params.push(`type=${encodeURIComponent(tipo)}`);
        if (nivel) params.push(`level=${encodeURIComponent(nivel)}`);
        if (atributo) params.push(`attribute=${encodeURIComponent(atributo)}`);
        
        url += params.join('&');
        console.log('URL final da busca:', url);

        const response = await fetch(url);
        const data = await response.json();
        console.log('Resposta da API:', data);

        if (data.error) {
            console.error('Erro retornado pela API:', data.error);
            return [];
        }

        // Mapear os dados para um formato consistente
        const cartas = (data.data || []).map(carta => ({
            name: carta.name,
            type: carta.type,
            attribute: carta.attribute,
            level: carta.level,
            image_url: carta.card_images?.[0]?.image_url,
            desc: carta.desc,
            atk: carta.atk,
            def: carta.def,
            id: carta.id
        }));

        console.log(`Encontradas ${cartas.length} cartas com os filtros especificados`);
        return cartas;
    } catch (error) {
        console.error('Erro ao buscar cartas filtradas:', error);
        return [];
    }
}

// Função para exibir os resultados na página
function exibirResultados(cartas) {
    console.log('Exibindo resultados:', cartas);
    const container = document.getElementById('card-results-container');
    container.innerHTML = ''; // Limpa resultados anteriores
    
    if (!cartas || cartas.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%;">Nenhuma carta encontrada com os filtros selecionados.</p>';
        return;
    }

    // Mostrar quantidade de cartas encontradas
    container.innerHTML = `<p style="text-align: center; width: 100%;">Encontradas ${cartas.length} cartas</p>`;

    cartas.forEach(carta => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        // Verifica se há imagem disponível
        const imagemUrl = carta.image_url || '';
        
        // Adiciona os detalhes da carta
        cardElement.innerHTML = `
            <h3>${carta.name || 'Nome não disponível'}</h3>
            ${imagemUrl ? `<img src="${imagemUrl}" alt="${carta.name}" style="width: 200px;">` : ''}
            <p><strong>Tipo:</strong> ${carta.type || 'N/A'}</p>
            <p><strong>Atributo:</strong> ${carta.attribute || 'N/A'}</p>
            <p><strong>Nível:</strong> ${carta.level || 'N/A'}</p>
            ${carta.desc ? `<p><strong>Descrição:</strong> ${carta.desc}</p>` : ''}
            ${carta.atk !== undefined ? `<p><strong>ATK:</strong> ${carta.atk}</p>` : ''}
            ${carta.def !== undefined ? `<p><strong>DEF:</strong> ${carta.def}</p>` : ''}
        `;
        container.appendChild(cardElement);
    });
}