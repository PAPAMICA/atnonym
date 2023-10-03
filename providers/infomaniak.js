// Function to get mailbox ID
async function getMailboxId(API_KEY, customer_name) {
    const API_URL = 'https://api.infomaniak.com/1/products';

    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const mailboxId = data.data.find(service => service.service_name === 'email_hosting' && service.customer_name === customer_name)?.id;
            if (mailboxId) {
                return mailboxId;
            } else {
                console.error('Failed to fetch mailbox ID:', response.status);
            }
        } else {
            console.error('Failed to fetch mailbox ID:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to get list of aliases
async function getAliases(API_KEY, emailAddress, MAILBOX_ID) {
    const API_URL = 'https://api.infomaniak.com/1/mail_hostings';

    try {
        const response = await fetch(`${API_URL}/${MAILBOX_ID}/mailboxes/${emailAddress}/aliases`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const aliases = data.data.aliases;
            return aliases;
        } else {
            console.error('Failed to fetch aliases:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to add an alias to an email address
async function addAlias(API_KEY, emailAddress, MAILBOX_ID, ALIASTOADD) {
    const API_URL = `https://api.infomaniak.com/1/mail_hostings/${MAILBOX_ID}/mailboxes/${emailAddress}/aliases`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alias: ALIASTOADD
            })
        });
        const data = await response.json();
        //console.log(data);
        if (response.ok) {
            console.log('Alias added successfully');
            return true;
        } else {
            console.error('Failed to add alias:', response.status, data.error.description);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to rename an alias by adding "DISABLE-" in front
async function renameAlias(API_KEY, emailAddress, MAILBOX_ID, ALIAS_TO_RENAME) {
    const API_URL = `https://api.infomaniak.com/1/mail_hostings/${MAILBOX_ID}/mailboxes/${emailAddress}/aliases/`;

    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aliases: [`DISABLE-${ALIAS_TO_RENAME}`]
            })
        });
        const data = await response.json();
        console.log(data)
        if (response.ok) {
            console.log('Alias renamed successfully');
            return true;
        } else {
            console.error('Failed to rename alias:', response.status, data.error.description);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to delete an alias
async function deleteAlias(API_KEY, emailAddress, MAILBOX_ID, ALIAS_TO_DELETE) {
    const API_URL = `https://api.infomaniak.com/1/mail_hostings/${MAILBOX_ID}/mailboxes/${emailAddress}/aliases/${ALIAS_TO_DELETE}`;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Alias deleted successfully');
            return true;
        } else {
            console.error('Failed to delete alias:', response.status, data.error.description);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// List Aliases function
async function listAliases(API_KEY, USER, DOMAIN) {
    try {
        const MAILBOX_ID = await getMailboxId(API_KEY, DOMAIN);
        const ALIASES = await getAliases(API_KEY, USER, MAILBOX_ID);
        return [MAILBOX_ID, ALIASES];
    } catch (error) {
        console.error('Error:', error);
        return [null, null];
    }
}

// Rename alias
async function renameAlias(API_KEY, USER, MAILBOX_ID, ALIAS) {
    let ALIAS_TO_RENAME;
    if (ALIAS.startsWith('DISABLE-')) {
        ALIAS_TO_RENAME = ALIAS.substring('DISABLE-'.length);
    } else {
        ALIAS_TO_RENAME = 'DISABLE-' + ALIAS;
    }
    const DELETED = await deleteAlias(API_KEY, USER, MAILBOX_ID, ALIAS);
    if (DELETED == true) {
        await addAlias(API_KEY, USER, MAILBOX_ID, ALIAS_TO_RENAME);
    }
}

// Main create function
async function main_create(API_KEY, EMAIL, ALIAS) {
    const [USER, DOMAIN] = EMAIL.split('@');
    const [MAILBOX_ID, ALIASES] = await listAliases(API_KEY, USER, DOMAIN);
    console.log(ALIASES)
    if (MAILBOX_ID !== null) {
        await addAlias(API_KEY, USER, MAILBOX_ID, ALIAS);
        const [MAILBOXS_ID, ALIASES] = await listAliases(API_KEY, USER, DOMAIN);
        console.log(ALIASES)
    }
}

// Main rename function
async function main_rename(API_KEY, EMAIL, ALIAS) {
    const [USER, DOMAIN] = EMAIL.split('@');
    const [MAILBOX_ID, ALIASES] = await listAliases(API_KEY, USER, DOMAIN);
    console.log(ALIASES)
    if (MAILBOX_ID !== null) {
        await renameAlias(API_KEY, USER, MAILBOX_ID, ALIAS);
        const [MAILBOXS_ID, ALIASES] = await listAliases(API_KEY, USER, DOMAIN);
        console.log(ALIASES)
    }
}


const API_KEY = '';
const EMAIL = '';
const ALIAS = '';

main_create();
main_rename();