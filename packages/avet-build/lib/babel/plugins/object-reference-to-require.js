const template = require('babel-template');
const generator = require('babel-generator');

module.exports = ({ types: t }) => {
  const buildDynamicImportAssignment = template(`
    var IMPORT_NAME = require(SOURCE).default;
  `);

  const buildInjectImportAssignment = template(`
    var NEW_IMPORT_NAME = IMPORT_NAME(app);
  `);

  function isParentIdentifier(member, parentMember) {
    if (!member) {
      return false;
    }
    const nextObject = member.get('object');
    if (!nextObject) {
      return false;
    }
    // todo: 优化这块的比较
    if (nextObject.node && nextObject.node.name === parentMember.name) {
      return true;
    }
    if (nextObject.isMemberExpression()) {
      return isParentIdentifier(nextObject, parentMember);
    }
    return false;
  }

  function visitVariableDeclarator(
    declaratorPath,
    injectNode,
    declarationPath,
    bodyPath,
    opts
  ) {
    const rightMemberPath = declaratorPath.get('init');
    if (isParentIdentifier(rightMemberPath, injectNode)) {
      const { code } = generator(rightMemberPath.node);
      const { name } = declaratorPath.node.id;
      const regex = new RegExp(`^${injectNode.name}.`);
      const dirArr = code.replace(regex, '').split('.');

      if (opts.ignore && opts.ignore.includes(dirArr[0])) {
        return;
      }

      if (opts.match && !opts.match.includes(dirArr[0])) {
        return;
      }
      declarationPath.insertBefore(
        buildInjectImportAssignment({
          NEW_IMPORT_NAME: t.identifier(name),
          IMPORT_NAME: t.identifier(`_${name}`),
        })
      );
      declarationPath.remove();

      bodyPath.insertBefore(
        buildDynamicImportAssignment({
          IMPORT_NAME: t.identifier(`_${name}`),
          SOURCE: t.stringLiteral(`../${dirArr.join('/').toLowerCase()}`),
        })
      );
    }
  }

  return {
    visitor: {
      Program: {
        exit(program, { opts }) {
          const body = program.get('body');
          for (const bodyPath of body) {
            if (bodyPath.isExportDefaultDeclaration()) {
              const declaration = bodyPath.get('declaration');
              if (
                declaration.isFunctionDeclaration() ||
                declaration.isArrowFunctionExpression() ||
                declaration.isFunctionExpression()
              ) {
                const params = declaration.get('params');
                const blockBody = declaration.get('body');
                const injectNode = params[0].node;
                blockBody.traverse({
                  VariableDeclaration(declarationPath) {
                    const declarators = declarationPath.get('declarations');
                    for (const declaratorPath of declarators) {
                      visitVariableDeclarator(
                        declaratorPath,
                        injectNode,
                        declarationPath,
                        bodyPath,
                        opts
                      );
                    }
                  },
                });
              }
            }

            if (bodyPath.isExpressionStatement()) {
              const declaration = bodyPath.get('expression.right');
              if (declaration.isFunctionExpression()) {
                const params = declaration.get('params');
                const blockBody = declaration.get('body');
                const injectNode = params[0].node;

                blockBody.traverse({
                  VariableDeclaration(declarationPath) {
                    const declarators = declarationPath.get('declarations');
                    for (const declaratorPath of declarators) {
                      visitVariableDeclarator(
                        declaratorPath,
                        injectNode,
                        declarationPath,
                        bodyPath,
                        opts
                      );
                    }
                  },
                });
              }
            }
          }
        },
      },
    },
  };
};
