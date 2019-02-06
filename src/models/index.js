
export const row = (r) => {
    let array = [];

    r.columns.forEach((c, index) => {
        c.id = index;
        array.push(new col(c));
    });

    r.selected = false;
    r.columns = array;
    r.visible = true;
    return r;
};

export const col = (c) => {
    let column = {};
    if(typeof(c) != "object")
    {
        column.value = c;
    } 
    else 
    {
        column = c;
    }
    column.isEditing = false;
    column.isDirty = false;
    column.orgValue = c.value;
    column.selected = false;

    if(column.type == null) {
        if(column.value == null && c.label.indexOf('date') < 0) {
            column.type = 'text'
        } else if(c.label.indexOf('date') >= 0 || Date.parse(c.value) && c.value.toString().indexOf('-') > 0) {
            column.type = 'date'
        } else if(isNaN(c.value.toString())) {
            column.type = 'text';
        } else {
            column.type = 'number';
        }
    };

    if(column.type == 'date' && column.value != null) 
    {
        let date = new Date(column.value),
            month = date.getMonth() + 1;
            
            column.value = date.getFullYear() + '-' + month + '-' + date.getDate()
    };
    
    return column;
};