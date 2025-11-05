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
                const containerWidth = certificatePreview.clientWidth;
                const containerHeight = certificatePreview.clientHeight;
                const imgRatio = img.naturalWidth / img.naturalHeight;
                const containerRatio = containerWidth / containerHeight;
                let newWidth, newHeight;

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

    // === Criação das divs arrastáveis com estilos individuais ===
    const updateDraggableDivs = () => {
        certificatePreview.querySelectorAll('.draggable-div').forEach(d => d.remove());

        document.querySelectorAll('.draggable-input').forEach(input => {
            const checkbox = input.parentElement.querySelector('.show-on-certificate');
            if (!checkbox || !checkbox.checked) return;

            const div = document.createElement('div');
            div.className = 'draggable-div';

            // Formata datas
            let value = input.value;
            if (input.type === 'date' && value) {
                const [year, month, day] = value.split('-');
                const date = new Date(year, month - 1, day);
                value = date.toLocaleDateString('pt-BR');
            }
            div.innerText = value;

            // Estilos individuais por campo
            const fieldId = input.dataset.fieldId;
            const fontSelect = document.querySelector(`.field-font[data-field-id="${fieldId}"]`);
            const fontSizeInput = document.querySelector(`.field-font-size[data-field-id="${fieldId}"]`);
            const colorInput = document.querySelector(`.field-color[data-field-id="${fieldId}"]`);

            Object.assign(div.style, {
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontFamily: fontSelect?.value || 'Arial, sans-serif',
                fontSize: (fontSizeInput?.value ? fontSizeInput.value + 'px' : '16px'),
                color: colorInput?.value || '#000',
                cursor: 'move',
                pointerEvents: 'auto',
                display: (toggleDraggablesCheckbox?.checked ?? true) ? 'block' : 'none'
            });

            certificatePreview.appendChild(div);

            // Atualiza valor em tempo real
            input.addEventListener('input', () => {
                let newValue = input.value;
                if (input.type === 'date' && newValue) {
                    const [year, month, day] = newValue.split('-');
                    const date = new Date(year, month - 1, day);
                    newValue = date.toLocaleDateString('pt-BR');
                }
                div.innerText = newValue;
            });

            // Atualiza estilo individual
            [fontSelect, fontSizeInput, colorInput].forEach(el => {
                el?.addEventListener('input', () => {
                    div.style.fontFamily = fontSelect?.value || 'Arial, sans-serif';
                    div.style.fontSize = fontSizeInput?.value ? fontSizeInput.value + 'px' : '16px';
                    div.style.color = colorInput?.value || '#000';
                });
            });

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

    // Atualiza divs ao mudar input, checkbox ou controles
    document.querySelectorAll('.draggable-input').forEach(input => {
        input.addEventListener('input', updateDraggableDivs);
        const checkbox = input.parentElement.querySelector('.show-on-certificate');
        checkbox?.addEventListener('change', updateDraggableDivs);
    });

    toggleDraggablesCheckbox?.addEventListener('change', () => {
        const display = toggleDraggablesCheckbox.checked ? 'block' : 'none';
        certificatePreview.querySelectorAll('.draggable-div').forEach(d => d.style.display = display);
    });

    updateDraggableDivs();

    // === Visualizar certificado ===
    renderBtn?.addEventListener('click', async e => {
        e.preventDefault();
        if (!certificadoVazioInput?.files?.length) {
            alert('Selecione o certificado vazio antes de visualizar.');
            return;
        }

        const nomeAlunoDiv = certificatePreview.querySelector('.draggable-nome-aluno');
        if (nomeAlunoDiv) nomeAlunoDiv.style.display = 'none';

        const canvas = await html2canvas(certificatePreview, { scale: 3 });
        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `Certificado_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        link.click();

        if (nomeAlunoDiv) nomeAlunoDiv.style.display = 'flex';
    });

    // === Submit ===
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const nomeAlunoDiv = certificatePreview.querySelector('.draggable-nome-aluno');

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

    // === Interceptar Enter ===
    form?.addEventListener('keydown', e => {
        if (e.key === 'Enter') e.preventDefault();
    });
});
