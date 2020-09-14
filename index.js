const validRules = {
    name: ['alpha', 'required'],
    last_name: ['alpha'],
    second_name: ['alpha'],
    email: ['required', 'email'],
    phone: ['required', 'phone'],
    company_title: ['alpha', 'required'],
    comments: ['check']
}
const errorList = {
    alpha: 'Поле должно быть текстовым',
    required: 'Обязательное поле',
    check: 'Обязательное поле',
    email: 'Неверный формат email',
    phone: 'Неверный формат телефона',
}


let modal = document.getElementById('mymodal')
let btn = document.getElementById('btn_modal_window')
let close = document.getElementsByClassName('close_modal_window')[0]

btn.onclick = () => {
    modal.style.display = "block"
}
close.onclick = () => {
    modal.style.display = "none"
}

window.onclick = () => {
    if(event.target == modal) {
        modal.style.display = "none"
    }
}


const form = document.getElementById('add_lead');
const sourceId = "WEBFORM";
const bitrixURL = 'https://samsonindustries.bitrix24.ru/rest/1/fy23n63z93rk82tu/';



let theme = () => {
    let checkBox = document.getElementById('check')
    if (checkBox.checked == true) {
        document.getElementById('topic').style.display = "inline-block"
    } else {
        document.getElementById('topic').style.display = 'none'
    }
}

const isValidForm = (user) => {
    const errorContainers = Array.from(document.querySelectorAll('#add_lead div'));
    errorContainers.forEach((item) => item.innerText = '')

    let isValid = true;
    let errors = {};
    for (let item in user) {
        let key = item.toLowerCase();
        if (key in validRules) {
            validRules[key].forEach((rule) => {
                switch (rule) {
                    case 'required':
                        if (user[item].length === 0) {
                            errors[key] = rule;
                        }
                        break;
                    case 'check':
                        if (user[item].length === 0 && document.getElementById('check').checked) {
                            errors[key] = rule;
                        }
                        break;
                    case 'alpha':
                        if(!validator.isAlpha(user[item], 'ru-RU') && user[item].length > 0) {
                            errors[key] = rule;
                        }
                        break;
                    case 'phone':
                        if (!validator.isMobilePhone(user[item], 'ru-RU')) {
                            errors[key] = rule;
                        }
                        break;
                    case 'email':
                        if (!validator.isEmail(user[item])) {
                            errors[key] = rule;
                        }
                        break;
                }
            })
        }
    }

    

    if (Object.keys(errors).length > 0) {
        for (let key in errors) {
            document.getElementById('error-' + key).innerText = errorList[errors[key]];
        }
        isValid = false;
    }
    return isValid;

    
}



form.onsubmit = (e) => {
    e.preventDefault();

    const fields = Array.from(form.children)
        .filter((field) => (field.nodeName !== 'BUTTON') && (field.type !=='checkbox') && (field.nodeName !== 'DIV'));

    let user = [];
    fields.forEach(
        (element) => user[element.getAttribute('name').toUpperCase()] = element.value
    );
    user['SOURCE_ID'] = sourceId;
    user['TITLE'] = `${user['LAST_NAME']} ${user['NAME']}`
    
    if (!isValidForm(user)) {
        return;
    }

    const url = encodeUrl(user);
    request = makeRequest(url);
    request.then((response) => {
        insertRow(
            `${user['LAST_NAME']} ${user['NAME']} ${user['SECOND_NAME']}`,
            user['COMPANY_TITLE'],
            user['COMMENTS']
        )
    });
}

const encodeUrl = (data) => {
    let url = new URL(`${bitrixURL}crm.lead.add.json`);
    for (let key in data) {
        if (key === 'PHONE' || key === 'EMAIL') {
            // Bitrix magic
            let fieldName = `fields[${key}][n0]`;
            url.searchParams.set(
                `${fieldName}[VALUE]`,
                data[key]
            );
            url.searchParams.set(
                `${fieldName}[VALUE_TYPE]`,
                'WORK'
            );
        } else {
            url.searchParams.set('fields[' + key + ']', data[key])
        }
    }

    return url;
}

const makeRequest = (url, method = 'POST') => {
    return fetch(url, {
        method: method,
    }).then(response => {
        if (response.status == 200) {
            return response.json()
        } else {
            throw new Error(response.status);
        }
    });
}

const getLeads = () => {
    request = makeRequest(bitrixURL + 'crm.lead.list.json');
    request.then((leads) => {
        leads.result.forEach((item) => {
            insertRow(
                `${item.LAST_NAME} ${item.NAME} ${item.SECOND_NAME}`,
                item.COMPANY_TITLE,
                item.COMMENTS
            )
        })
    })
}



const getCol = (value) => {
    const col = document.createElement("td");
    col.appendChild(document.createTextNode(value));
    return col;
}

const insertRow = (name, company, comment) => {
    const list = document.getElementById('lead_list');
    const row = document.createElement("tr");
    row.appendChild(getCol(name));        
    row.appendChild(getCol(company));        
    row.appendChild(getCol(comment));        
    list.appendChild(row);
}


getLeads();