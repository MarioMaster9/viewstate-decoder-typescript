declare global {
    var currentContent: string;
}

class HTMLWriter {
    static writeBeginTag(tagName: string) {
        currentContent += `<${tagName}>`;
    }

    static writeEndTag(tagName: string) {
        currentContent += `</${tagName}>`;
    }

    static writeContent(content: string) {
        currentContent += content;
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
        document.getElementById("result").innerHTML = currentContent;
        currentContent = "";
    }

    
}

export {HTMLWriter}