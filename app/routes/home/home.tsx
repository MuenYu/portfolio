import { Footer } from '~/components/footer';
import { baseMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { ProjectSummary, type ProjectSummaryModel } from './project-summary';
import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import type { ProjectModel } from '~/types/config';
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

const buildProjectModel = (project: (typeof config.projects)[number]): ProjectSummaryModel => {
  if (project.models.length === 1) {
    const [singleModel] = project.models;
    const textures: [ProjectModel] = [
      {
        srcSet: `${singleModel.srcSet} 800w, ${singleModel.srcSet} 1920w`,
        placeholder: singleModel.placeholder,
      },
    ];

    return {
      type: 'laptop',
      alt: `${project.title} UI`,
      textures,
    };
  }

  const [firstModel, secondModel] = project.models;

  const textures: [ProjectModel, ProjectModel] = [
    {
      srcSet: `${firstModel.srcSet} 375w, ${firstModel.srcSet} 750w`,
      placeholder: firstModel.placeholder,
    },
    {
      srcSet: `${secondModel.srcSet} 375w, ${secondModel.srcSet} 750w`,
      placeholder: secondModel.placeholder,
    },
  ];

  return {
    type: 'phone',
    alt: `${project.title} UI`,
    textures,
  };
};

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState<HTMLElement[]>([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef<HTMLElement | null>(null);
  const projects = useMemo(
    () =>
      Array.from({ length: config.projects.length }, () =>
        createRef<HTMLElement>()
      ),
    []
  );
  const about = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sectionRefs = [intro, ...projects, about];
    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            observer.unobserve(entry.target);
            setVisibleSections(prevSections => {
              if (prevSections.includes(entry.target)) {
                return prevSections;
              }

              return [...prevSections, entry.target];
            });
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    sectionRefs.forEach(section => {
      const element = section.current;
      if (element) {
        sectionObserver.observe(element);
      }
    });

    let indicatorObserver: IntersectionObserver | null = null;

    if (intro.current) {
      indicatorObserver = new IntersectionObserver(
        ([entry]) => {
          setScrollIndicatorHidden(!entry.isIntersecting);
        },
        { rootMargin: '-100% 0px 0px 0px' }
      );

      indicatorObserver.observe(intro.current);
    }

    return () => {
      sectionObserver.disconnect();
      indicatorObserver?.disconnect();
    };
  }, [projects]);

  const aboutElement = about.current;
  const isAboutVisible = aboutElement ? visibleSections.includes(aboutElement) : false;

  return (
    <div className={styles.home}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      {config.projects.map((project, index) => {
        const projectRef = projects[index];
        const projectElement = projectRef.current;
        const isProjectVisible = projectElement
          ? visibleSections.includes(projectElement)
          : false;
        const summaryModel = buildProjectModel(project);

        return (
          <ProjectSummary
            key={project.title}
            id={`project-${index + 1}`}
            sectionRef={projectRef}
            visible={isProjectVisible}
            index={index + 1}
            title={project.title}
            description={project.description}
            buttons={project.buttons}
            model={summaryModel}
          />
        );
      })}
      <Profile sectionRef={about} visible={isAboutVisible} id="about" />
      <Footer />
    </div>
  );
};
