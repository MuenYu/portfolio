import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { Fragment, useState } from 'react';
import { media } from '~/utils/style';
import katakana from './katakana.svg';
import styles from './profile.module.css';
import config from '~/config';

const renderTextWithLinks = text => {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [_, title, link] = linkMatch;
      return (
        <Link key={index} href={link}>
          {title}
        </Link>
      );
    }
    return part;
  });
};

const ProfileText = ({ visible, titleId }) => {
  const paragraphs = config.profile.paragraphs.map((paragraph, index) => (
    <Text
      key={index}
      className={styles.description}
      data-visible={visible}
      size="l"
      as="p"
    >
      {renderTextWithLinks(paragraph)}
    </Text>
  ));
  return (
    <Fragment>
      <Heading className={styles.title} data-visible={visible} level={3} id={titleId}>
        <DecoderText text={config.profile.greeting} start={visible} delay={500} />
      </Heading>
      {paragraphs}
    </Fragment>
  );
};

export const Profile = ({ id, visible, sectionRef }) => {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.profile}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {({ visible, nodeRef }) => (
          <div className={styles.content} ref={nodeRef}>
            <div className={styles.column}>
              <ProfileText visible={visible} titleId={titleId} />
              <Button
                secondary
                className={styles.button}
                data-visible={visible}
                href="/contact"
                icon="send"
              >
                Send me a message
              </Button>
            </div>
            <div className={styles.column}>
              <div className={styles.tag} aria-hidden>
                <Divider
                  notchWidth="64px"
                  notchHeight="8px"
                  collapsed={!visible}
                  collapseDelay={1000}
                />
                <div className={styles.tagText} data-visible={visible}>
                  About me
                </div>
              </div>
              <div className={styles.image}>
                <Image
                  reveal
                  delay={100}
                  placeholder={config.profile.img.placeholder}
                  srcSet={`${config.profile.img.normal} 480w, ${config.profile.img.large} 960w`}
                  width={960}
                  height={1280}
                  sizes={`(max-width: ${media.mobile}px) 100vw, 480px`}
                  alt="My profile picture"
                />
                {/* <svg className={styles.svg} data-visible={visible} viewBox="0 0 136 766">
                  <use href={`${katakana}#katakana-profile`} />
                </svg> */}
              </div>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
