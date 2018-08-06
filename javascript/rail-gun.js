// !function ($, window, document, undefined) {

//自定义报错类型
function RailGunError(message, solveWay) {
    this.name = 'railGunError';
    this.message = message;
    this.solveWay = solveWay;
}

RailGunError.prototype = Object.create(Error.prototype);
RailGunError.prototype.constructor = RailGunError;

//定义菜单构造函数
function RailGun($element, options) {
    this.defaults = {};//默认值
    this.menuLevels = 0;//菜单层次
    this.options = this._getRealOptions(this.defaults, options);
    this.$element = $element;
    // try {
    if (this.options.menuList instanceof Array) {
        this.render();
        // } else {
        //     throw new RailGunError('Invalid menuList.', 'Please check options.menuList');
        // }
        // } catch (e) {
        //     console.error(e.name + ':' + e.message + (e.solveWay || ''));
    }
}

RailGun.prototype = {
    //根据参数与默认值生成真实参数
    _getRealOptions: function (defaults, options) {
        return $.extend({}, defaults, options);
    },
    //菜单默认css
    menusCss: {
        width: '100px',
        height: '500px',
        background: '#373d41'
    },
    //渲染
    render: function () {
        this._setOffset(this.offsetTop || this.options.top,
            this.offsetLeft || this.options.left);
        this.menuLevels = this.getMenuLevels(0);
        //todo 一级菜单渲染
        //按层级渲染
        for (var i = 0; i < this.menuLevels; i++) {
            this.$element.append(this._renderMenuByIndex(i));
        }
    },
    getMenuLevels: function (index, menuList) {
        //第一层菜单
        menuList = menuList || $.extend([], this.options.menuList, true);
        if (!index) {
            this['menu' + index] = [];
            //第一层菜单数组
            for (var i = 0; i < menuList.length; i++) {
                if (!menuList[i].parentId) {
                    this['menu' + index].push(menuList[i].menuId);
                    menuList.splice(i, 1);
                }
            }
            if (this['menu' + index].length > 0) {
                return this.getMenuLevels(index + 1, menuList);
            } else {
                return index;
            }
        } else {
            this['menu' + index] = [];
            for (var i = 0; i < menuList.length; i++) {
                if (this['menu' + (index - 1)] && this['menu' + (index - 1)].length > 0) {
                    //判断是否是父菜单的子菜单，生成次层菜单数组
                    if ($.inArray(menuList[i].parentId, this['menu' + (index - 1)]) !== -1) {
                        this['menu' + index].push(menuList[i].menuId);
                        menuList.splice(i, 1);
                    }
                }
            }
            if (this['menu' + index].length > 0) {
                return this.getMenuLevels(index + 1, menuList);
            } else {
                return index;
            }
        }
    },
    //按照层级渲染
    _renderMenuByIndex(index) {
        var opt = this;
        var menusCss = this._getRealOptions(this.menusCss, this.options['menusCss' + index]);
        var menu = $('<div></div>').css(menusCss)
            .data('rg-menu-index', '' + index)
            .css({
                position: 'absolute',
                left: menusCss.width.substring(0, menusCss.width.length - 2) * index + 'px'
            });
        debugger;
        var menuList = this._sortMemuList(this._getMenuList(index));
        for (var i = 0; i < menuList.length; i++) {
            !function () {
                var idx = i;
                var menuInfo = menuList[idx];
                menu.append($('<span>' + (menuInfo.description || 'test') + '</span>')
                    .data('rg-id', menuInfo.menuId)
                    .data('rg-seq', '' + menuInfo.seqNumber)
                    .data('rg-item-index', '' + index).click(function (ev) {
                        alert(idx);
                        menuInfo.clickFunc(menuInfo.menuId, menuInfo.description, menuInfo.seqNumber, menuInfo.parentId, ev);
                    }))
            }();
        }
        return menu;
    },
    //根据层次获取数列的详细信息
    _getMenuList(index) {
        return this.options.menuList.filter(function (value) {
            for (var i = 0; i < this['menu' + index].length; i++) {
                if (value.menuId === this['menu' + index][i]) {
                    return true;
                }
            }
        }, this)
    },
    //根据seqNumber排序
    _sortMemuList: function (menuList) {
        var sortBySeqNumber = function (x, y) {
            switch (true) {
                case x.seqNumber < y.seqNumber:
                    return -1;
                case x.seqNumber > y.seqNumber:
                    return 1;
                default:
                    return 0;
            }
        };
        return menuList.sort(sortBySeqNumber);
    },
    //获取当前div的位置信息
    _setOffset: function (top, left) {
        this.offsetTop = top || this.$element.offset().top + this.$element.height();
        this.offsetLeft = left || this.$element.offset().left;
    },
    setOffset: function (top, left) {
        this.offsetTop = top || this.$element.offset().top + this.$element.height();
        this.offsetLeft = left || this.$element.offset().left;
        this.render();
    }

};

$.fn.railGun = function (options) {
    this.each(function () {
        var menu = new RailGun($(this), options);
        console.log(menu.menuLevels);
    });
    return this;
};

// }(jQuery, window, document);
