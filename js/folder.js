/**
 * @file do.js
 * @author HenryLulu
 * @description ……
 */

function Pair(left, right, pairMap) {
    this.left = left;
    this.right = right;
    this.pairMap = pairMap;
    this.isOpen = true;
    this.init();
    this.event();
}

Pair.prototype = {
    init: function () {
        var me = this;
        me.lineNum = me.left.find('[data-line-number]').data('line-number');
        me.$btn = $('<div>-</div>').css({
            position: 'absolute',
            left: '0',
            top: '0'
        });
        me.$points = $('<span style="display: none;">...</span>');
        me.left.find('.blob-num').css({
            position: 'relative'
        }).append(me.$btn);
        me.left.find('.blob-code').css({
            position: 'relative',
            cursor: 'pointer'
        }).append(me.$points);
    },
    event: function () {
        var me = this;
        me.left.off('click');
        me.left.on('click', '.blob-code', function () {
            me.handleInner(me.isOpen);
        });
    },
    handleInner: function (ifClose) {
        var me = this;
        var next = me.left.next();
        while (next && !next.is(me.right)) {
            var nextLineNum = next.find('[data-line-number]').data('line-number');
            var innerPair = me.pairMap[nextLineNum];
            if (ifClose) {
                // 如果关闭操作，直接逐行隐藏
                next.hide();
                next = next.next();
            } else {
                // 如果打开操作，当检测到内部Pair时，Pair头尾照常展示，next跳过Pair内部，交给Pair自己根据isOpen状态更新
                next.show();
                if (innerPair) {
                    next = innerPair.right;
                    innerPair.handleInner(!innerPair.isOpen);
                } else {
                    next = next.next();
                }
            }
        }
        if (ifClose) {
            me.$points.show();
            me.$btn.text('+');
        } else {
            me.$points.hide();
            me.$btn.text('-');
        }
        me.isOpen = !ifClose;
    }
};

function Folder() {
    this.$rows = $('.blob-wrapper table tr');
    this.quateStack = [];
    this.pairMap = {};
    this.exp = /\{|\}/g;
    this.init();
}

Folder.prototype = {
    init: function () {
        var me = this;
        me.$rows.each(function () {
            var cur = $(this);
            var curText = cur.text();
            var res;
            while (res = me.exp.exec(curText)) {
                if (res[0] === '{') {
                    me.quateStack.push(cur);
                } else if (res[0] === '}') {
                    var left = me.quateStack.pop();
                    if (!left.is(cur)) {
                        var pair = new Pair(left, cur, me.pairMap);
                        me.pairMap[pair.lineNum] = pair;
                    }
                }
            }
        });
    }
};

new Folder();
