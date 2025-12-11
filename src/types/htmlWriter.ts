(globalThis as any).currentContent = "";

class HTMLWriter {
    static writeBeginTag(tagName: string) {
        (globalThis as any).currentContent += `<${tagName}>`;
    }

    static writeEndTag(tagName: string) {
        (globalThis as any).currentContent += `</${tagName}>`;
    }

    static writeContent(content: string) {
        (globalThis as any).currentContent += content;
    }

    static writeListItem(content: string) {
        HTMLWriter.writeBeginTag("li");
        HTMLWriter.writeContent(content);
        HTMLWriter.writeEndTag("li");
    }

    static writeStringListItem(content: string) {
        content = content.replaceAll("<", "&lt;");
        content = content.replaceAll(">", "&gt;");
        HTMLWriter.writeBeginTag("li");
        HTMLWriter.writeContent(content);
        HTMLWriter.writeEndTag("li");
    }

    static pop() {
        document.getElementById("result").innerHTML = (globalThis as any).currentContent;
        (globalThis as any).currentContent = "";
    }

    
}

export {HTMLWriter}