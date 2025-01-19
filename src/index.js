import en from './locale/en';
import loadBlocks from './blocks';
import loadCommands from './commands';

// Add style manager sectors for designers
const addDesignerStyles = (editor) => {
  // Layout & Positioning Sector
  editor.StyleManager.addSector('layout', {
    name: 'Layout & Position',
    open: true,
    properties: [{
      name: 'Display',
      property: 'display',
      type: 'select',
      defaults: 'block',
      options: [
        { value: 'block', name: 'Block' },
        { value: 'inline', name: 'Inline' },
        { value: 'flex', name: 'Flex' },
        { value: 'grid', name: 'Grid' },
        { value: 'hidden', name: 'Hidden' }
      ],
      // Tailwind sınıflarını uygula
      toStyle(value) {
        return { class: value };
      }
    }, {
      name: 'Position',
      property: 'position',
      type: 'select',
      options: [
        { value: 'static', name: 'Static' },
        { value: 'relative', name: 'Relative' },
        { value: 'absolute', name: 'Absolute' },
        { value: 'fixed', name: 'Fixed' }
      ],
      toStyle(value) {
        return { class: value };
      }
    }]
  });

  // Size & Spacing Sector
  editor.StyleManager.addSector('dimensions', {
    name: 'Size & Spacing',
    open: true,
    properties: [{
      name: 'Width',
      property: 'width',
      type: 'select',
      defaults: 'w-auto',
      options: [
        { value: 'w-auto', name: 'Auto' },
        { value: 'w-full', name: '100%' },
        { value: 'w-1/2', name: '50%' },
        { value: 'w-1/3', name: '33.33%' },
        { value: 'w-1/4', name: '25%' }
      ],
      toStyle(value) {
        return { class: value };
      }
    }, {
      name: 'Height',
      property: 'height',
      type: 'select',
      defaults: 'auto',
      options: [
        { value: 'h-auto', name: 'Auto' },
        { value: 'h-full', name: '100%' },
        { value: 'h-screen', name: 'Viewport' },
        { value: 'h-1/2', name: '50%' }
      ]
    }, {
      name: 'Padding',
      property: 'padding',
      type: 'composite',
      properties: [{
        name: 'Top',
        property: 'padding-top',
        type: 'select',
        options: [
          { value: 'pt-0', name: '0' },
          { value: 'pt-2', name: 'Small' },
          { value: 'pt-4', name: 'Medium' },
          { value: 'pt-8', name: 'Large' }
        ]
      },
      // ... benzer şekilde right, bottom, left için
      ]
    }]
  });

  // Typography Sector
  editor.StyleManager.addSector('typography', {
    name: 'Typography',
    open: true,
    properties: [{
      name: 'Font Size',
      property: 'font-size',
      type: 'select',
      defaults: 'text-base',
      options: [
        { value: 'text-xs', name: 'Extra Small' },
        { value: 'text-sm', name: 'Small' },
        { value: 'text-base', name: 'Normal' },
        { value: 'text-lg', name: 'Large' },
        { value: 'text-xl', name: 'Extra Large' }
      ],
      toStyle(value) {
        return { class: value };
      }
    }, {
      name: 'Font Weight',
      property: 'font-weight',
      type: 'select',
      defaults: 'font-normal',
      options: [
        { value: 'font-light', name: 'Light' },
        { value: 'font-normal', name: 'Regular' },
        { value: 'font-medium', name: 'Medium' },
        { value: 'font-bold', name: 'Bold' }
      ]
    }]
  });

  // Effects Sector
  editor.StyleManager.addSector('effects', {
    name: 'Effects',
    open: true,
    properties: [{
      name: 'Opacity',
      property: 'opacity',
      type: 'select',
      defaults: 'opacity-100',
      options: [
        { value: 'opacity-0', name: '0%' },
        { value: 'opacity-50', name: '50%' },
        { value: 'opacity-75', name: '75%' },
        { value: 'opacity-100', name: '100%' }
      ],
      toStyle(value) {
        return { class: value };
      }
    }, {
      name: 'Shadow',
      property: 'box-shadow',
      type: 'select',
      defaults: 'shadow-none',
      options: [
        { value: 'shadow-none', name: 'None' },
        { value: 'shadow-sm', name: 'Small' },
        { value: 'shadow', name: 'Normal' },
        { value: 'shadow-lg', name: 'Large' }
      ]
    }]
  });
};

export default (editor, opts = {}) => {
  const options = {
    ...{
      i18n: {},
      // default options
      tailwindPlayCdn: 'https://cdn.tailwindcss.com',
      plugins: [],
      config: {},
      cover: `.object-cover { filter: sepia(1) hue-rotate(190deg) opacity(.46) grayscale(.7) !important; }`,
      changeThemeText: 'Change Theme',
      openCategory: 'Blog',
    }, ...opts
  };

  // Add blocks
  loadBlocks(editor, options);
  // Add commands
  loadCommands(editor, options);
  // Load i18n files
  editor.I18n && editor.I18n.addMessages({
    en,
    ...options.i18n,
  });

  // Add designer-friendly style sectors
  addDesignerStyles(editor);

  // Add custom style manager properties
  editor.StyleManager.addProperty('example', {
    name: 'Example Color',
    property: 'example-color',
    type: 'color',
    defaults: '#000000'
  });

  // Add style manager sector (category)
  editor.StyleManager.addSector('example', {
    name: 'Example',
    open: false,
    properties: ['example-property']
  }, { at: 0 }); // This will add the category at the top

  const appendTailwindCss = async (frame) => {
    const iframe = frame.view.getEl();

    if (!iframe) return;

    const { tailwindPlayCdn, plugins, config, cover } = options;
    const init = () => {
      iframe.contentWindow.tailwind.config = config;
    }

    const script = document.createElement('script');
    script.src = tailwindPlayCdn + (plugins.length ? `?plugins=${plugins.join()}` : '');
    script.onload = init;

    const cssStyle = document.createElement('style');
    cssStyle.innerHTML = cover;

    // checks iframe is ready before loading Tailwind CSS - issue with firefox
    const f = setInterval(() => {
      const doc = iframe.contentDocument;
      if (doc && doc.readyState && doc.readyState === 'complete') {
        doc.head.appendChild(script);
        doc.head.appendChild(cssStyle);
        clearInterval(f);
      }
    }, 100)
  }

  editor.Canvas.getModel()['on']('change:frames', (m, frames) => {
    frames.forEach(frame => frame.once('loaded', () => appendTailwindCss(frame)));
  });

  editor.on('load', () => {
    appendTailwindCss(editor.Canvas.getModel());
  });

  // Style değişikliklerini dinle ve sınıfları uygula
  editor.on('component:selected', (component) => {
    if (!component) return;
    
    // Mevcut sınıfları koru
    const existingClasses = component.getClasses();
    
    // Stil değişikliklerini dinle
    component.on('change:style', () => {
      const style = component.getStyle();
      let classes = [...existingClasses];
      
      // Her stil özelliği için Tailwind sınıfını ekle
      Object.entries(style).forEach(([prop, value]) => {
        if (value && value.class) {
          classes.push(value.class);
        }
      });
      
      // Sınıfları güncelle
      component.setClass(classes);
    });
  });
};
