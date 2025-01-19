import en from './locale/en';
import loadBlocks from './blocks';
import loadCommands from './commands';
import { source as carousel } from './carousel';

// PostCSS ile işlenmiş CSS'i import et
import './styles/tailwind.css';

export default (editor, opts = {}) => {
  const options = {
    ...{
      i18n: {},
      // default options
      config: {},
      cover: `.object-cover { filter: sepia(1) hue-rotate(190deg) opacity(.46) grayscale(.7) !important; }`,
      changeThemeText: 'Change Theme',
      openCategory: 'Blog',
    }, ...opts
  };

  // Add blocks
  loadBlocks(editor, options);
  loadCommands(editor, options);
  // Load i18n files
  editor.I18n && editor.I18n.addMessages({
    en,
    ...options.i18n,
  });

  const appendTailwindCss = async (frame) => {
    // Frame kontrolü
    if (!frame) return;

    // Frame'in yüklenmesini bekle
    await new Promise(resolve => {
      const checkView = () => {
        if (frame.view) {
          resolve();
        } else {
          setTimeout(checkView, 50);
        }
      };
      checkView();
    });

    const iframe = frame.view.getEl();
    if (!iframe) return;

    const { cover } = options;
    
    const cssStyle = document.createElement('style');
    cssStyle.innerHTML = cover;

    // Add Flowbite script
    const flowbiteScript = document.createElement('script');
    flowbiteScript.src = 'https://unpkg.com/flowbite@1.4.0/dist/flowbite.js';

    // checks iframe is ready before loading Tailwind CSS
    const f = setInterval(() => {
      const doc = iframe.contentDocument;
      if (doc && doc.readyState && doc.readyState === 'complete') {
        doc.head.appendChild(cssStyle);
        doc.head.appendChild(flowbiteScript);
        clearInterval(f);
      }
    }, 100);
  }

  editor.Canvas.getModel()['on']('change:frames', (m, frames) => {
    frames.forEach(frame => frame.once('loaded', () => appendTailwindCss(frame)));
  });

  editor.on('load', () => {
    appendTailwindCss(editor.Canvas.getModel());
  });

  editor.BlockManager.add('carousel', {
    label: 'Carousel',
    content: carousel,
    category: 'Basic',
    attributes: {
      class: 'fa fa-sliders'
    },
    select: true,
    draggable: true,
    droppable: true,
    resizable: {
      tl: 0,
      tc: 0,
      tr: 0,
      cl: 0,
      cr: 0,
      bl: 0,
      bc: 0,
      br: 0
    }
  }); 
};
