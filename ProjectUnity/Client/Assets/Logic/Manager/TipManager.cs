using DG.Tweening;
using RG.Zeluda;
using UnityEngine;
using UnityEngine.UI;

public class TipManager:ManagerBase
{
    public static void Tip(string msg)
    {
        UIManager uiManager = CBus.Instance.GetManager(ManagerName.UIManager) as UIManager;
        GameObject obj = GameObject.Instantiate(Resources.Load<GameObject>("Prefab/tip"));
        obj.transform.parent = uiManager.tran_float;
        obj.transform.localPosition = Vector3.zero;
        obj.transform.localScale = Vector3.zero;
        Text txt = obj.GetComponentInChildren<Text>();
        txt.text = msg;
        Sequence seq = DOTween.Sequence();
        seq.Append(obj.transform.DOScale(Vector3.one, 1));
        seq.Append(obj.transform.DOLocalMoveY(Screen.height / 2, 1));
        seq.AppendCallback(()=> {
            GameObject.Destroy(obj);
        });
    
    }
}
