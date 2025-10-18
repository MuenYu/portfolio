import { Footer } from '~/components/footer';
import { baseMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { ProjectSummary } from './project-summary';
import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import config from '~/config.json';
import styles from './home.module.css';

// Prefetch draco decoader wasm
export const links = () => {
  return [
    {
      rel: 'prefetch',
      href: '/draco/draco_wasm_wrapper.js',
      as: 'script',
      type: 'text/javascript',
      importance: 'low',
    },
    {
      rel: 'prefetch',
      href: '/draco/draco_decoder.wasm',
      as: 'fetch',
      type: 'application/wasm',
      importance: 'low',
    },
  ];
};

export const meta = () => {
  return baseMeta({
    title: config.role,
    description: `Portfolio of ${config.name} — a ${config.role}`,
  });
};

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState<Element[]>([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef<HTMLElement | null>(null);
  const projects = useMemo(() => config.projects.map(() => createRef<HTMLElement>()), []);
  const about = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sections: (MutableRefObject<HTMLElement | null> | RefObject<HTMLElement>)[] = [
      intro,
      ...projects,
      about,
    ];

    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target;
            observer.unobserve(section);
            if (visibleSections.includes(section)) return;
            setVisibleSections(prevSections => [...prevSections, section]);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    sections.forEach(section => {
      if (section.current) {
        sectionObserver.observe(section.current);
      }
    });

    if (intro.current) {
      indicatorObserver.observe(intro.current);
    }

    return () => {
      sectionObserver.disconnect();
      indicatorObserver.disconnect();
    };
  }, [visibleSections, projects, intro]);

  return (
    <div className={styles['home']}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      {config.projects.map((project, index) => (
        <ProjectSummary
          key={index}
          id={`project-${index + 1}`}
          sectionRef={projects[index]}
          visible={
            !!projects[index].current && visibleSections.includes(projects[index].current)
          }
          index={index + 1}
          title={project.title}
          description={project.description}
          buttons={project.buttons}
          model={{
            type: project.models.length === 1 ? 'laptop' : 'phone',
            alt: `${project.title} UI`,
            textures:
              project.models.length === 1
                ? [
                    {
                      srcSet: `${project.models[0].srcSet} 800w, ${project.models[0].srcSet} 1920w`,
                      placeholder: project.models[0].placeholder,
                    },
                  ]
                : [
                    {
                      srcSet: `${project.models[0].srcSet} 375w, ${project.models[0].srcSet} 750w`,
                      placeholder: project.models[0].placeholder,
                    },
                    {
                      srcSet: `${project.models[1].srcSet} 375w, ${project.models[1].srcSet} 750w`,
                      placeholder: project.models[1].placeholder,
                    },
                  ],
          }}
        />
      ))}
      <Profile
        sectionRef={about}
        visible={visibleSections.includes(about.current)}
        id="about"
      />
      <Footer />
    </div>
  );
};
