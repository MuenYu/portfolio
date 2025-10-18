import { useRef, type MutableRefObject } from 'react';
import type { ActionFunctionArgs } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';
import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Footer } from '~/components/footer';
import { Heading } from '~/components/heading';
import { Icon } from '~/components/icon';
import { Input } from '~/components/input';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { useFormInput } from '~/hooks';
import { cssProps, msToNum, numToMs } from '~/utils/style';
import { baseMeta } from '~/utils/meta';
import type { PortfolioContext } from '~/types/context';
import styles from './contact.module.css';

export const meta = () => {
  return baseMeta({
    title: 'Contact',
    description:
      'Send me a message if you’re interested in discussing a project or if you just want to say hi',
  });
};

const MAX_EMAIL_LENGTH = 512;
const MAX_MESSAGE_LENGTH = 4096;
const EMAIL_PATTERN = /(.+)@(.+){2,}\.(.+){2,}/;

interface ContactErrors {
  readonly email?: string;
  readonly message?: string;
}

interface ContactActionData {
  readonly success?: boolean;
  readonly errors?: ContactErrors;
}

export async function action({ context, request }: ActionFunctionArgs<PortfolioContext>) {
  const formData = await request.formData();
  const rawName = formData.get('name');
  const rawEmail = formData.get('email');
  const rawMessage = formData.get('message');
  const isBot = typeof rawName === 'string' ? rawName : '';
  const email = typeof rawEmail === 'string' ? rawEmail : '';
  const message = typeof rawMessage === 'string' ? rawMessage : '';
  let errors: ContactErrors = {};

  // Return without sending if a bot trips the honeypot
  if (isBot) return Response.json({ success: true });

  // Handle input validation on the server
  if (!email || !EMAIL_PATTERN.test(email)) {
    errors = { ...errors, email: 'Please enter a valid email address.' };
  }

  if (!message) {
    errors = { ...errors, message: 'Please enter a message.' };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    errors = {
      ...errors,
      email: `Email address must be shorter than ${MAX_EMAIL_LENGTH} characters.`,
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    errors = {
      ...errors,
      message: `Message must be shorter than ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors });
  }

  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: context.cloudflare.env.SERVICE_ID,
      template_id: context.cloudflare.env.TEMPLATE_ID,
      user_id: context.cloudflare.env.USER_ID,
      accessToken: context.cloudflare.env.ACCESSTOKEN,
      template_params: {
        email,
        message,
      },
    }),
  });

  if (!resp.ok) {
    errors = { ...errors, message: await resp.text() };
    return Response.json({ errors });
  }

  return Response.json({ success: true });
}

export const Contact = () => {
  const errorRef = useRef<HTMLDivElement>(null);
  const email = useFormInput('');
  const message = useFormInput('');
  const initDelay = tokens.base.durationS;
  const actionData = useActionData<ContactActionData>();
  const { state } = useNavigation();
  const sending = state === 'submitting';

  return (
    <Section className={styles['contact']}>
      <Transition unmount in={!actionData?.success} timeout={1600}>
        {({ status, nodeRef }) => (
          <Form
            unstable_viewTransition
            className={styles['form']}
            method="post"
            ref={nodeRef as MutableRefObject<HTMLFormElement | null>}
          >
            <Heading
              className={styles['title']}
              data-status={status}
              level={3}
              as="h1"
              style={getDelay(tokens.base.durationXS, initDelay, 0.3)}
            >
              <DecoderText text="Say hello" start={status !== 'exited'} delay={300} />
            </Heading>
            <Divider
              className={styles['divider']}
              data-status={status}
              style={getDelay(tokens.base.durationXS, initDelay, 0.4)}
            />
            {/* Hidden honeypot field to identify bots */}
            <Input
              className={styles['botkiller']}
              label="Name"
              name="name"
              maxLength={MAX_EMAIL_LENGTH}
            />
            <Input
              required
              className={styles['input']}
              data-status={status}
              style={getDelay(tokens.base.durationXS, initDelay)}
              autoComplete="email"
              label="Your email"
              type="email"
              name="email"
              maxLength={MAX_EMAIL_LENGTH}
              {...email}
            />
            <Input
              required
              multiline
              className={styles['input']}
              data-status={status}
              style={getDelay(tokens.base.durationS, initDelay)}
              autoComplete="off"
              label="Message"
              name="message"
              maxLength={MAX_MESSAGE_LENGTH}
              {...message}
            />
            <Transition
              unmount
              in={!sending && actionData?.errors}
              timeout={msToNum(tokens.base.durationM)}
            >
              {({ status: errorStatus, nodeRef }) => (
                <div
                  className={styles['formError']}
                  ref={nodeRef}
                  data-status={errorStatus}
                  style={cssProps({
                    height: errorStatus ? (errorRef.current?.offsetHeight ?? 0) : 0,
                  })}
                >
                  <div className={styles['formErrorContent']} ref={errorRef}>
                    <div className={styles['formErrorMessage']}>
                      <Icon className={styles['formErrorIcon']} icon="error" />
                      {actionData?.errors?.email}
                      {actionData?.errors?.message}
                    </div>
                  </div>
                </div>
              )}
            </Transition>
            <Button
              className={styles['button']}
              data-status={status}
              data-sending={sending}
              style={getDelay(tokens.base.durationM, initDelay)}
              disabled={sending}
              loading={sending}
              loadingText="Sending..."
              icon="send"
              type="submit"
            >
              Send message
            </Button>
          </Form>
        )}
      </Transition>
      <Transition unmount in={actionData?.success}>
        {({ status, nodeRef }) => (
          <div className={styles['complete']} aria-live="polite" ref={nodeRef}>
            <Heading
              level={3}
              as="h3"
              className={styles['completeTitle']}
              data-status={status}
            >
              Message Sent
            </Heading>
            <Text
              size="l"
              as="p"
              className={styles['completeText']}
              data-status={status}
              style={getDelay(tokens.base.durationXS)}
            >
              I’ll get back to you within a couple days, sit tight
            </Text>
            <Button
              secondary
              iconHoverShift
              className={styles['completeButton']}
              data-status={status}
              style={getDelay(tokens.base.durationM)}
              href="/"
              icon="chevron-right"
            >
              Back to homepage
            </Button>
          </div>
        )}
      </Transition>
      <Footer className={styles['footer']} />
    </Section>
  );
};

function getDelay(delayMs: string, offset = numToMs(0), multiplier = 1) {
  const numDelay = msToNum(delayMs) * multiplier;
  return cssProps({ delay: numToMs((msToNum(offset) + numDelay).toFixed(0)) });
}
