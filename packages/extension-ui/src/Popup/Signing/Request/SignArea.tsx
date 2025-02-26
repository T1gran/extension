// Copyright 2019-2025 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { PASSWORD_EXPIRY_MIN } from '@polkadot/extension-base/defaults';

import { ActionBar, ActionContext, Button, ButtonArea, Checkbox, Link } from '../../../components/index.js';
import { useTranslation } from '../../../hooks/index.js';
import { approveSignPassword, cancelSignRequest, isSignLocked } from '../../../messaging.js';
import { styled } from '../../../styled.js';
import Unlock from '../Unlock.js';

interface Props {
  address?: string;
  buttonText: string;
  className?: string;
  error: string | null;
  isExternal?: boolean;
  isFirst: boolean;
  setError: (value: string | null) => void;
  signId: string;
}

function SignArea ({ address, buttonText, className, error, isExternal, isFirst, setError, signId }: Props): React.ReactElement {
  const [savePass, setSavePass] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [isWhitelistChecked, setIsWhitelistChecked] = useState<boolean>(false);
  
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const onAction = useContext(ActionContext);
  const { t } = useTranslation();

  useEffect(() => {
    setIsLocked(null);
    let timeout: ReturnType<typeof setTimeout>;

    !isExternal && isSignLocked(signId)
      .then(({ isLocked, remainingTime }) => {
        setIsLocked(isLocked);
        timeout = setTimeout(() => {
          setIsLocked(true);
        }, remainingTime);

        !isLocked && setSavePass(true);
      })
      .catch((error: Error) => console.error(error));

    return () => {
      !!timeout && clearTimeout(timeout);
    };
  }, [isExternal, signId]);

  const checkWhitelist = useCallback(async (address: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/check-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const result = await response.json();
      return result.isWhitelisted;
    } catch (error) {
      console.error('Error checking whitelist:', error);
      throw new Error('Failed to check whitelist.');
    }
  }, []);

  const handleCheckWhitelist = useCallback(async (): Promise<void> => {
    if (!address) {
      setError('Address is missing.');
      return;
    }
  
    try {
      const isWhitelisted = await checkWhitelist(address);
  
      if (isWhitelisted) {
        setIsWhitelisted(true);
        setIsWhitelistChecked(true);
        setError(null);
      } else {
        setIsWhitelisted(false);
        setIsWhitelistChecked(true);
        setError('Address is not whitelisted.');
      }
    } catch (error) {
      console.error('Error checking whitelist:', error);
      setError('Failed to check whitelist.');
    }
  }, [address, checkWhitelist, setError]);

  const _onSign = useCallback(
    (): void => {
      if (!isWhitelisted) {
        setError('Address is not whitelisted.');
        return;
      }
  
      setIsBusy(true);
      approveSignPassword(signId, savePass, password)
        .then((): void => {
          setIsBusy(false);
          onAction();
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          setError(error.message);
          console.error(error);
        });
    },
    [onAction, password, savePass, setError, setIsBusy, signId, isWhitelisted]
  );

  const _onCancel = useCallback(
    (): void => {
      cancelSignRequest(signId)
        .then(() => onAction())
        .catch((error: Error) => console.error(error));
    },
    [onAction, signId]
  );

  const RememberPasswordCheckbox = () => (
    <Checkbox
      checked={savePass}
      label={isLocked
        ? t(
          'Remember my password for the next {{expiration}} minutes',
          { replace: { expiration: PASSWORD_EXPIRY_MIN } }
        )
        : t(
          'Extend the period without password by {{expiration}} minutes',
          { replace: { expiration: PASSWORD_EXPIRY_MIN } }
        )
      }
      onChange={setSavePass}
    />
  );

  return (
    <ButtonArea className={className}>
      {isFirst && !isExternal && (
        <>
          {isLocked && (
            <Unlock
              error={error}
              isBusy={isBusy}
              onSign={_onSign}
              password={password}
              setError={setError}
              setPassword={setPassword}
            />
          )}
          <RememberPasswordCheckbox />
          <Button
            onClick={handleCheckWhitelist}
            isDisabled={isBusy || isWhitelisted}
          >
            {isWhitelisted ? 'Whitelist Verified' : 'Check Whitelist'}
          </Button>
          <Button
            isBusy={isBusy}
            isDisabled={!isWhitelistChecked || !isWhitelisted ||(!!isLocked && !password) || !!error}
            onClick={_onSign}
          >
            {buttonText}
          </Button>
        </>
      )}
      <ActionBar className='cancelButton'>
        <Link
          isDanger
          onClick={_onCancel}
        >
          {t('Cancel')}
        </Link>
      </ActionBar>
    </ButtonArea>
  );
}

export default styled(SignArea) <Props>`
  flex-direction: column;
  padding: 6px 24px;

  .cancelButton {
    margin-top: 4px;
    margin-bottom: 4px;
    text-decoration: underline;

    a {
      margin: auto;
    }
  }
`;
