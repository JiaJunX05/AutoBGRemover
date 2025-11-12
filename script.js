/**
 * 背景移除工具 - JavaScript
 * 使用 remove.bg API 实现图片背景移除功能
 */

// ==================== 配置常量 ====================
const REMOVEBG_API_KEY = "Fqq8hF36ZQswSi4wMdW9vuve";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
const ALERT_AUTO_CLOSE_TIME = 5000; // 5秒

// ==================== 全局变量 ====================
let processedImageBlob = null;
let originalFile = null;
let scale = 1;
let translateY = 0;

// ==================== 初始化 ====================
$(document).ready(function() {
    initDragAndDrop();
    initFormHandler();
    initModalHandlers();
    initZoomHandlers();
    initButtonHandlers();
});

// ==================== 按钮事件处理 ====================
function initButtonHandlers() {
    // 选择文件按钮
    $('#selectFileBtn').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const fileInput = document.getElementById('image');
        if (fileInput) {
            fileInput.click();
        }
    });
    
    // 取消按钮 - 刷新页面
    $('#cancelResultBtn').on('click', function(e) {
        e.preventDefault();
        location.reload();
    });
}

// ==================== 拖放功能 ====================
function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('image');
    
    if (!dropZone || !fileInput) return;
    
    // 防止默认拖放行为
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // 高亮拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('border-primary', 'bg-primary-subtle');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('border-primary', 'bg-primary-subtle');
        }, false);
    });
    
    // 处理拖放
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, false);
    
    // 处理文件选择
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            handleFile(this.files[0]);
        }
    });
    
    // 点击拖放区域选择文件
    dropZone.addEventListener('click', function(e) {
        // 排除垃圾桶按钮和预览内容
        if (e.target.closest('#removePreviewBtn') || 
            e.target.id === 'previewImage' || 
            e.target.id === 'previewFileName') {
            return;
        }
        fileInput.click();
    });
    
    // 垃圾桶按钮移除预览
    $('#removePreviewBtn').on('click', function(e) {
        e.stopPropagation();
        resetDropZone();
    });
}

// ==================== 文件处理 ====================
function handleFile(file) {
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
        showAlert('文件大小超过 5MB，请选择更小的文件。', 'danger');
        resetDropZone();
        return;
    }
    
    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showAlert('不支持的文件类型。仅支持 JPG、PNG 和 GIF 格式。', 'danger');
        resetDropZone();
        return;
    }
    
    // 设置文件到 input
    const fileInput = document.getElementById('image');
    if (!fileInput.files || fileInput.files.length === 0 || fileInput.files[0] !== file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    }
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        $('#previewImage').attr('src', e.target.result);
        $('#previewFileName').text(file.name);
        $('#dropZoneContent').addClass('d-none');
        $('#dropZonePreview').removeClass('d-none');
        $('#removePreviewBtn').removeClass('d-none');
        $('#submitBtn').prop('disabled', false);
    };
    reader.readAsDataURL(file);
}

function resetDropZone() {
    $('#dropZoneContent').removeClass('d-none');
    $('#dropZonePreview').addClass('d-none');
    $('#removePreviewBtn').addClass('d-none');
    $('#image').val('');
    $('#submitBtn').prop('disabled', true);
}

// ==================== 提示信息 ====================
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    // 根据类型选择图标
    const iconMap = {
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle',
        'success': 'check-circle'
    };
    const icon = iconMap[type] || 'info-circle';
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${icon}-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // 自动关闭
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, ALERT_AUTO_CLOSE_TIME);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 图片处理 ====================
function processImage(file) {
    // 保存原始文件以便重新处理
    originalFile = file;
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
        showAlert('文件大小超过 5MB，请选择更小的文件。', 'danger');
        return;
    }
    
    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showAlert('不支持的文件类型。仅支持 JPG、PNG 和 GIF 格式。', 'danger');
        return;
    }
    
    // 显示进度条
    $("#progressBarContainer").show();
    $("#result").hide();
    $("#progressBar").css("width", "0%").attr("aria-valuenow", 0);
    
    // 动画点效果
    let dots = 0;
    const dotsInterval = setInterval(function() {
        dots = (dots + 1) % 4;
        $("#dots").text('.'.repeat(dots));
    }, 500);
    
    // 模拟进度条增长
    let progress = 0;
    const progressInterval = setInterval(function() {
        if (progress < 90) {
            progress += 2;
            $("#progressBar").css("width", progress + "%").attr("aria-valuenow", progress);
        }
    }, 100);
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    
    // 调用 remove.bg API
    fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
            'X-Api-Key': REMOVEBG_API_KEY
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.blob();
    })
    .then(blob => {
        clearInterval(progressInterval);
        clearInterval(dotsInterval);
        
        // 更新进度条到 100%
        $("#progressBar").css("width", "100%").attr("aria-valuenow", 100);
        $("#dots").text('');
        
        // 保存处理后的图片
        processedImageBlob = blob;
        
        // 创建图片 URL 并显示
        const imageUrl = URL.createObjectURL(blob);
        $("#processedImage").attr("src", imageUrl);
        $("#modalImage").attr("src", imageUrl);
        
        // 延迟隐藏进度条，显示结果
        setTimeout(function() {
            $("#progressBarContainer").hide();
            $("#result").show();
        }, 500);
    })
    .catch(error => {
        clearInterval(progressInterval);
        clearInterval(dotsInterval);
        $("#progressBarContainer").hide();
        $("#dots").text('');
        
        // 处理错误信息
        let errorMessage = "处理图片时发生错误。";
        if (error.errors && error.errors.length > 0) {
            errorMessage = error.errors[0].title || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert("错误: " + errorMessage, 'danger');
        console.error("API 错误:", error);
    });
}

// ==================== 表单处理 ====================
function initFormHandler() {
    // 表单提交
    $("#uploadForm").on("submit", function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('image');
        const file = fileInput.files[0];
        
        if (!file) {
            showAlert('请先选择一张图片！', 'warning');
            return;
        }
        
        processImage(file);
    });
    
    // 再来一次按钮
    $('#retryBtn').on('click', function(e) {
        e.preventDefault();
        if (originalFile) {
            processImage(originalFile);
        } else {
            showAlert('无法重新处理，请重新选择图片。', 'warning');
        }
    });
}

// ==================== 模态框处理 ====================
function initModalHandlers() {
    // 点击图片显示模态框
    $("#processedImage").on("click", function() {
        const imageUrl = $(this).attr("src");
        $("#modalImage").attr("src", imageUrl);
        $("#imageModal").modal("show");
        
        // 重置缩放和位置
        scale = 1;
        translateY = 0;
        $("#modalImage").css("transform", `scale(${scale}) translateY(${translateY}px)`);
    });
    
    // 下载按钮
    $("#downloadBtn").on("click", function() {
        if (processedImageBlob) {
            const url = URL.createObjectURL(processedImageBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'removed-background.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}

// ==================== 图片缩放功能 ====================
function initZoomHandlers() {
    const modalImage = document.getElementById('modalImage');
    const zoomContainer = document.getElementById('zoomContainer');
    
    if (!modalImage || !zoomContainer) return;
    
    // 鼠标滚轮缩放和移动
    zoomContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.shiftKey) {
            // Shift + 滚轮：上下移动
            const delta = e.deltaY > 0 ? 20 : -20;
            translateY += delta;
        } else {
            // 滚轮：缩放
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.min(Math.max(scale + delta, 1), 5);
        }
        
        updateImageTransform();
    });
    
    // 键盘控制
    document.addEventListener('keydown', function(e) {
        if (!$("#imageModal").hasClass('show')) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                translateY -= 20;
                break;
            case 'ArrowDown':
                e.preventDefault();
                translateY += 20;
                break;
            case '+':
            case '=':
                e.preventDefault();
                scale = Math.min(scale + 0.1, 5);
                break;
            case '-':
            case '_':
                e.preventDefault();
                scale = Math.max(scale - 0.1, 1);
                break;
            case '0':
                e.preventDefault();
                scale = 1;
                translateY = 0;
                break;
        }
        
        updateImageTransform();
    });
    
    // 触摸控制
    let lastTouchDistance = 0;
    let startY = null;
    
    zoomContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            lastTouchDistance = getTouchDistance(e.touches);
        } else if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
        }
    });
    
    zoomContainer.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            // 双指缩放
            const currentTouchDistance = getTouchDistance(e.touches);
            const delta = (currentTouchDistance - lastTouchDistance) / 200;
            scale = Math.min(Math.max(scale + delta, 1), 5);
            lastTouchDistance = currentTouchDistance;
        } else if (e.touches.length === 1 && startY !== null) {
            // 单指移动
            const deltaY = (e.touches[0].clientY - startY) / 10;
            translateY += deltaY;
            startY = e.touches[0].clientY;
        }
        
        updateImageTransform();
    });
    
    zoomContainer.addEventListener('touchend', function(e) {
        if (e.touches.length === 0) {
            startY = null;
            lastTouchDistance = 0;
        }
    });
    
    // 获取两指间的距离
    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 更新图片变换
    function updateImageTransform() {
        modalImage.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        modalImage.style.transition = 'transform 0.1s ease-out';
    }
    
    // 模态框关闭时重置
    $("#imageModal").on('hidden.bs.modal', function() {
        scale = 1;
        translateY = 0;
        updateImageTransform();
    });
}
