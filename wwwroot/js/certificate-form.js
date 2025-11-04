document.addEventListener('DOMContentLoaded', function () {
    const certificatePreview = document.getElementById('certificatePreview');
    const certificadoVazioInput = document.querySelector('input[name="certificadoVazioFile"]');
    const renderBtn = document.getElementById('renderCertificateBtn');
    const toggleDraggablesCheckbox = document.getElementById('toggleDraggables');

    const form = document.getElementById('certificateForm');
    let certificadoBase64Input = document.getElementById('CertificadoGeradoBase64');
    if (!certificadoBase64Input) {
        certificadoBase64Input = document.createElement('input');
        certificadoBase64Input.type = 'hidden';
        certificadoBase64Input.name = 'CertificadoGeradoBase64';
        certificadoBase64Input.id = 'CertificadoGeradoBase64';
        form.appendChild(certificadoBase64Input);
    }

    // === Exibir certificado e ajustar ao card ===
    certificadoVazioInput?.addEventListener('change', e => {
        const file = e.target.files[0];
        const img = document.getElementById('certificadoVazioImg');
        const previewPlaceholder = document.querySelector('.preview-placeholder');

        if (!file) {
            img.src = '';
            img.style.display = 'none';
            if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = 'block';
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';

            img.onload = () => {
                // pega tamanho do container
                const containerWidth = certificatePreview.clientWidth;
                const containerHeight = certificatePreview.clientHeight;

                const imgRatio = img.naturalWidth / img.naturalHeight;
                const containerRatio = containerWidth / containerHeight;

                let newWidth, newHeight;

                // Ajusta proporcionalmente para caber dentro do card-body
                if (imgRatio > containerRatio) {
                    newWidth = containerWidth;
                    newHeight = newWidth / imgRatio;
                } else {
                    newHeight = containerHeight;
                    newWidth = newHeight * imgRatio;
                }

                img.style.width = newWidth + 'px';
                img.style.height = newHeight + 'px';
                img.style.objectFit = 'contain';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.display = 'block';
                img.style.margin = '0 auto';
            };
        };
        reader.readAsDataURL(file);
    });

    // === Controles globais de estilo ===
    const fontSelector = document.getElementById('draggableFont');
    const fontSizeInput = document.getElementById('draggableFontSize');
    const fontColorInput = document.getElementById('draggableFontColor');
    const fontWeightInput = document.getElementById('draggableFontWeight');
    const textAlignSelector = document.getElementById('draggableTextAlign');

    let nomeAlunoDiv = null;

    const getStyleValues = () => ({
        fontFamily: fontSelector?.value || 'Arial, sans-serif',
        fontSize: fontSizeInput?.value + 'px' || '16px',
        color: fontColorInput?.value || '#000',
        fontWeight: fontWeightInput?.checked ? 'bold' : 'normal',
        textAlign: textAlignSelector?.value || 'left'
    });

    // === Criação das divs arrastáveis ===
    const updateDraggableDivs = () => {
        certificatePreview.querySelectorAll('.draggable-div').forEach(d => d.remove());

        document.querySelectorAll('.draggable-input').forEach(input => {
            const checkbox = input.parentElement.querySelector('.show-on-certificate');
            if (!checkbox || !checkbox.checked) return;

            const styleValues = getStyleValues();
            const div = document.createElement('div');
            div.className = 'draggable-div';
            div.innerText = input.value || '';
            Object.assign(div.style, {
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontFamily: styleValues.fontFamily,
                fontSize: styleValues.fontSize,
                color: styleValues.color,
                fontWeight: styleValues.fontWeight,
                textAlign: styleValues.textAlign,
                cursor: 'move',
                pointerEvents: 'auto',
                display: (toggleDraggablesCheckbox?.checked ?? true) ? 'block' : 'none'
            });

            certificatePreview.appendChild(div);
            input.addEventListener('input', () => div.innerText = input.value);

            // Função de arrastar
            let isDragging = false, offsetX = 0, offsetY = 0;
            div.addEventListener('mousedown', e => {
                isDragging = true;
                offsetX = e.offsetX;
                offsetY = e.offsetY;
            });
            document.addEventListener('mousemove', e => {
                if (!isDragging) return;
                const rect = certificatePreview.getBoundingClientRect();
                div.style.left = (e.pageX - rect.left - offsetX) + 'px';
                div.style.top = (e.pageY - rect.top - offsetY) + 'px';
            });
            document.addEventListener('mouseup', () => isDragging = false);
        });
    };

    // Atualiza quando mudar input, checkbox ou estilo
    document.querySelectorAll('.draggable-input').forEach(input => {
        input.addEventListener('input', updateDraggableDivs);
        const checkbox = input.parentElement.querySelector('.show-on-certificate');
        checkbox?.addEventListener('change', updateDraggableDivs);
    });

    [fontSelector, fontSizeInput, fontColorInput, fontWeightInput, textAlignSelector].forEach(el => {
        el?.addEventListener('change', updateDraggableDivs);
    });

    updateDraggableDivs();

    toggleDraggablesCheckbox?.addEventListener('change', () => {
        const display = toggleDraggablesCheckbox.checked ? 'block' : 'none';
        certificatePreview.querySelectorAll('.draggable-div').forEach(d => d.style.display = display);
    });

    // === Gerar imagem no clique de "Visualizar" ===
    renderBtn?.addEventListener('click', async e => {
        e.preventDefault();
        if (!certificadoVazioInput?.files?.length) {
            alert('Selecione o certificado vazio antes de visualizar.');
            return;
        }

        nomeAlunoDiv = certificatePreview.querySelector('.draggable-nome-aluno');
        if (nomeAlunoDiv) nomeAlunoDiv.style.display = 'none';

        const canvas = await html2canvas(certificatePreview, { scale: 3 });
        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `Certificado_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        link.click();

        if (nomeAlunoDiv) nomeAlunoDiv.style.display = 'flex';
    });

    // === Bloquear submit até tudo estar correto ===
    form.addEventListener('submit', async e => {
        e.preventDefault();

        nomeAlunoDiv = certificatePreview.querySelector('.draggable-nome-aluno');

        if (!certificadoVazioInput?.files?.length || !nomeAlunoDiv || nomeAlunoDiv.style.border !== '2px solid green') {
            alert('Certifique-se de que o certificado está carregado e o Nome do Aluno está travado!');
            return;
        }

        nomeAlunoDiv.style.display = 'none';
        nomeAlunoDiv.style.pointerEvents = 'none';

        const canvas = await html2canvas(certificatePreview, { scale: 3 });
        certificadoBase64Input.value = canvas.toDataURL('image/png');

        nomeAlunoDiv.style.pointerEvents = 'auto';
        nomeAlunoDiv.style.display = 'flex';

        const configNomeAluno = {
            top: nomeAlunoDiv.style.top,
            left: nomeAlunoDiv.style.left,
            width: nomeAlunoDiv.offsetWidth,
            height: nomeAlunoDiv.offsetHeight,
            fontFamily: nomeAlunoDiv.style.fontFamily,
            fontSize: nomeAlunoDiv.style.fontSize,
            color: nomeAlunoDiv.style.color,
            fontWeight: nomeAlunoDiv.style.fontWeight,
            textAlign: nomeAlunoDiv.style.textAlign
        };

        let configInput = document.getElementById('NomeAlunoConfig');
        if (!configInput) {
            configInput = document.createElement('input');
            configInput.type = 'hidden';
            configInput.name = 'NomeAlunoConfig';
            configInput.id = 'NomeAlunoConfig';
            form.appendChild(configInput);
        }
        configInput.value = JSON.stringify(configNomeAluno);

        form.submit();
    });

    // === Interceptar Enter para não enviar antes da hora ===
    form?.addEventListener('keydown', e => {
        if (e.key === 'Enter') e.preventDefault();
    });
});
